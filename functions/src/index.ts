
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

/**
 * Creates a notification in each opted-in user's subcollection when a new notice is created.
 * Handles batching for large user counts and correctly identifies opted-in users.
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
      // 1. Fetch all users. We will filter them in the function itself.
      const usersSnapshot = await db.collection("users").get();
      if (usersSnapshot.empty) {
        functions.logger.log("No users found to send notifications to.");
        return;
      }

      // 2. Filter users who should receive notifications.
      // A user is opted-in if `notifications` is explicitly `true` OR if the field is missing (default behavior).
      // A user is opted-out only if `notifications` is explicitly `false`.
      const optedInUsers = usersSnapshot.docs.filter(doc => {
        const userData = doc.data();
        return userData.notifications !== false; 
      });
      
      if (optedInUsers.length === 0) {
          functions.logger.log("No users have notifications enabled.");
          return;
      }

      // 3. Firestore batch writes are limited to 500 operations.
      // We process users in chunks to stay within this limit.
      const MAX_BATCH_SIZE = 499; 
      const chunks = [];
      for (let i = 0; i < optedInUsers.length; i += MAX_BATCH_SIZE) {
        chunks.push(optedInUsers.slice(i, i + MAX_BATCH_SIZE));
      }

      let totalNotifications = 0;

      // 4. Process each chunk as a separate batch
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
    // Check for classes whose notification time falls within the next 5 minutes.
    // The notification should be sent 15 mins before the class.
    // So we are looking for classes that start between 15 and 20 minutes from now.
    const reminderWindowStart = new Date(now.getTime() + 15 * 60 * 1000);
    const reminderWindowEnd = new Date(now.getTime() + 20 * 60 * 1000);
    const todayDayString = now.toLocaleDateString('en-US', { weekday: 'long' });

    try {
        const usersSnapshot = await db.collection("users").get();
        const optedInUsers = usersSnapshot.docs.filter(doc => doc.data().notifications !== false);

        if (optedInUsers.length === 0) {
            functions.logger.log("No opted-in users to check for reminders.");
            return;
        }

        let reminderCount = 0;

        for (const userDoc of optedInUsers) {
            const userId = userDoc.id;
            const timetableSnapshot = await db.collection('timetables').doc(userId).get();
            const timetable = timetableSnapshot.data();
            
            if (!timetable || !timetable.entries) continue;

            const batch = db.batch();
            let batchHasWrites = false;
            
            for (const entry of timetable.entries) {
                if (entry.day.toLowerCase() !== todayDayString.toLowerCase()) continue;

                const [hours, minutes] = entry.start.split(':').map(Number);
                const classStartTime = new Date();
                classStartTime.setHours(hours, minutes, 0, 0);

                // Check if the class start time is within our target window (15-20 mins from now)
                if (classStartTime > reminderWindowStart && classStartTime <= reminderWindowEnd) {
                    const notificationId = `reminder-${entry.id}-${classStartTime.toISOString().split('T')[0]}`;
                    const notificationRef = db.collection('users').doc(userId).collection('notifications').doc(notificationId);
                    
                    const existingNotif = await notificationRef.get();
                    // Only create a notification if one for this class on this day doesn't already exist.
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
                        batchHasWrites = true;
                    }
                }
            }

            if (batchHasWrites) {
                await batch.commit();
            }
        }
        
        if (reminderCount > 0) {
            functions.logger.log(`Successfully created ${reminderCount} class reminders.`);
        } else {
            functions.logger.log("No upcoming classes found for reminders in this interval.");
        }

    } catch (error) {
        functions.logger.error("Error running scheduleClassReminders:", error);
    }
});
