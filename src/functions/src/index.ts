
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

/**
 * Creates a notification in each opted-in user's subcollection when a new notice is created.
 * Handles batching for large user counts.
 */
export const createNotificationOnNewNotice = functions.firestore
  .document("notices/{noticeId}")
  .onCreate(async (snap, context) => {
    const notice = snap.data();
    if (!notice) {
      functions.logger.log("No data associated with the notice creation event.");
      return;
    }

    const noticeTitle = notice.title || "New Announcement";
    const { noticeId } = context.params;

    try {
      const usersSnapshot = await db.collection("users").get();
      if (usersSnapshot.empty) {
        functions.logger.log("No users found to send notifications to.");
        return;
      }

      // Filter users who have explicitly opted-in to notifications.
      const optedInUsers = usersSnapshot.docs.filter(doc => doc.data().notifications === true);
      
      if (optedInUsers.length === 0) {
          functions.logger.log("No users have notifications enabled.");
          return;
      }

      // Firestore batch writes are limited to 500 operations.
      // We process users in chunks to stay within this limit.
      const MAX_BATCH_SIZE = 499; 
      const chunks = [];
      for (let i = 0; i < optedInUsers.length; i += MAX_BATCH_SIZE) {
        chunks.push(optedInUsers.slice(i, i + MAX_BATCH_SIZE));
      }

      let totalNotifications = 0;

      for (const chunk of chunks) {
        const batch = db.batch();
        chunk.forEach((userDoc) => {
          const userId = userDoc.id;
          const notificationRef = db
            .collection("users")
            .doc(userId)
            .collection("notifications")
            .doc(); // Auto-generate ID

          batch.set(notificationRef, {
            userId: userId,
            type: "new_notice",
            title: `New Notice: ${noticeTitle}`,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            relatedEntityId: noticeId,
          });
        });
        await batch.commit();
        totalNotifications += chunk.length;
      }

      functions.logger.log(
        `Successfully created notifications for ${totalNotifications} users for notice ${noticeId}.`
      );

    } catch (error) {
      functions.logger.error(
        `Error creating notifications for new notice ${noticeId}:`,
        error
      );
    }
  });


/**
 * A scheduled function that runs every 5 minutes to send class reminders.
 * It creates a notification for users 15 minutes before their class starts.
 */
export const scheduleClassReminders = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
    const now = new Date();
    const reminderTimeStart = admin.firestore.Timestamp.fromDate(new Date(now.getTime() + 14 * 60 * 1000));
    const reminderTimeEnd = admin.firestore.Timestamp.fromDate(new Date(now.getTime() + 16 * 60 * 1000));
    const todayDayString = now.toLocaleDateString('en-US', { weekday: 'long' });

    try {
        const usersSnapshot = await db.collection("users").where("notifications", "==", true).get();
        if (usersSnapshot.empty) {
            functions.logger.log("No users with notifications enabled to check for reminders.");
            return;
        }

        const batch = db.batch();
        let reminderCount = 0;

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            const timetableSnapshot = await db.collection('timetables').doc(userId).get();
            const timetable = timetableSnapshot.data();
            
            if (!timetable || !timetable.entries) continue;
            
            for (const entry of timetable.entries) {
                if (entry.day !== todayDayString) continue;

                const [hours, minutes] = entry.start.split(':').map(Number);
                const classStartTime = new Date();
                classStartTime.setHours(hours, minutes, 0, 0);

                const notificationTime = new Date(classStartTime.getTime() - 15 * 60 * 1000);
                
                // Check if the calculated notification time is within our 2-minute check window
                if (notificationTime > reminderTimeStart.toDate() && notificationTime <= reminderTimeEnd.toDate()) {
                    const notificationId = `reminder-${entry.id}-${classStartTime.toISOString().split('T')[0]}`;
                    const notificationRef = db.collection('users').doc(userId).collection('notifications').doc(notificationId);
                    
                    const existingNotif = await notificationRef.get();
                    if (!existingNotif.exists) {
                       batch.set(notificationRef, {
                            userId: userId,
                            type: "class_reminder",
                            title: `Reminder: ${entry.subject} starts in 15 mins`,
                            read: false,
                            createdAt: admin.firestore.FieldValue.serverTimestamp(),
                            relatedEntityId: entry.id,
                        });
                        reminderCount++;
                    }
                }
            }
        }
        
        if (reminderCount > 0) {
            await batch.commit();
            functions.logger.log(`Successfully created ${reminderCount} class reminders.`);
        } else {
            functions.logger.log("No upcoming classes found for reminders in this interval.");
        }

    } catch (error) {
        functions.logger.error("Error running scheduleClassReminders:", error);
    }
});
