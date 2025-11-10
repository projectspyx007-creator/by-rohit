import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

export const createNotificationOnNewNotice = functions.firestore
  .document("notices/{noticeId}")
  .onCreate(async (snap, context) => {
    const notice = snap.data();
    if (!notice) {
      functions.logger.log("No data associated with the notice creation event.");
      return;
    }

    const noticeTitle = notice.title || "New Announcement";

    try {
      // Get all users
      const usersSnapshot = await db.collection("users").get();
      if (usersSnapshot.empty) {
        functions.logger.log("No users found to send notifications to.");
        return;
      }

      const batch = db.batch();

      usersSnapshot.forEach((userDoc) => {
        const userId = userDoc.id;
        const userProfile = userDoc.data();
        
        // Only send notification if user has them enabled in their profile
        // This now correctly handles cases where 'notifications' might be undefined or true
        if (userProfile.notifications === false) {
            functions.logger.log(`Skipping notification for user ${userId} because they have disabled them.`);
            return;
        }

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
          createdAt: admin.firestore.FieldValue.serverTimestamp(), // Use server timestamp for reliability
          relatedEntityId: context.params.noticeId, // Link to the notice
        });
      });

      // Commit the batch
      await batch.commit();
      functions.logger.log(
        `Successfully created notifications for ${usersSnapshot.size} users for notice ${context.params.noticeId}.`
      );
    } catch (error) {
      functions.logger.error(
        "Error creating notifications for new notice:",
        error
      );
    }
  });
