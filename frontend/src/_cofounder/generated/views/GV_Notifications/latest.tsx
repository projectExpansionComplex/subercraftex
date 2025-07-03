import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, remove_notification } from '@/store/main';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

const NotificationIcons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const notificationColors = {
  success: 'bg-green-100 border-green-500 text-green-700',
  error: 'bg-red-100 border-red-500 text-red-700',
  info: 'bg-blue-100 border-blue-500 text-blue-700',
  warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
};

const GV_Notifications: React.FC = () => {
  const notifications = useSelector((state: RootState) => state.notifications.messages);
  const dispatch = useDispatch();

  const removeNotification = useCallback((id: string) => {
    dispatch(remove_notification(id));
  }, [dispatch]);

  useEffect(() => {
    notifications.forEach((notification) => {
      if (!notification.modal) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration || 5000);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, removeNotification]);

  return (
    <>
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 w-80 sm:w-96">
        <AnimatePresence>
          {notifications.filter(n => !n.modal).map((notification) => {
            const Icon = NotificationIcons[notification.type];
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: -50, scale: 0.3 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                className={`flex items-center px-4 py-3 rounded-lg shadow-lg border ${notificationColors[notification.type]}`}
              >
                <Icon className="flex-shrink-0 w-5 h-5 mr-2" />
                <p className="flex-grow text-sm">{notification.message}</p>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Modal Notification */}
      <AnimatePresence>
        {notifications.filter(n => n.modal).map((notification) => {
          const Icon = NotificationIcons[notification.type];
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
              >
                <div className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">{notification.title || 'Notification'}</h2>
                  <div className="flex items-start">
                    <Icon className={`w-6 h-6 mr-3 ${notificationColors[notification.type].split(' ')[2]}`} />
                    <p className="text-gray-700">{notification.message}</p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 p-4 bg-gray-50 rounded-b-lg">
                  <Button variant="secondary" onClick={() => removeNotification(notification.id)}>
                    Close
                  </Button>
                  {notification.action && (
                    <Button onClick={() => {
                      notification.action();
                      removeNotification(notification.id);
                    }}>
                      {notification.actionText || 'Action'}
                    </Button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </>
  );
};

export default React.memo(GV_Notifications);