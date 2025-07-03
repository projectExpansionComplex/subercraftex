import React, { useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { RootState, AppDispatch, remove_notification } from '@/store/main';

// Custom hook for managing notification timeout
const useNotificationTimeout = (id: string, duration: number, onDismiss: (id: string) => void) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onDismiss(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);
};

// Toast Notification Component
const ToastNotification: React.FC<{ notification: any; onDismiss: (id: string) => void }> = React.memo(({ notification, onDismiss }) => {
  useNotificationTimeout(notification.id, notification.duration, onDismiss);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: 50 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -50, x: 50 }}
      className={`max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 ${
        notification.type === 'success' ? 'bg-green-50' : notification.type === 'error' ? 'bg-red-50' : 'bg-blue-50'
      }`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${
              notification.type === 'success' ? 'text-green-800' : notification.type === 'error' ? 'text-red-800' : 'text-blue-800'
            }`}>
              {notification.message}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => onDismiss(notification.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <XMarkIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
});

// Modal Notification Component
const ModalNotification: React.FC<{ notification: any; onDismiss: (id: string) => void }> = React.memo(({ notification, onDismiss }) => {
  return (
    <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {notification.title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{notification.message}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {notification.action && (
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => {
                  notification.action.handler();
                  onDismiss(notification.id);
                }}
              >
                {notification.action.label}
              </button>
            )}
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => onDismiss(notification.id)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// Banner Notification Component
const BannerNotification: React.FC<{ notification: any; onDismiss: (id: string) => void }> = React.memo(({ notification, onDismiss }) => {
  return (
    <div className="fixed top-0 inset-x-0 pb-2 sm:pb-5 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="p-2 rounded-lg bg-indigo-600 shadow-lg sm:p-3">
          <div className="flex items-center justify-between flex-wrap">
            <div className="w-0 flex-1 flex items-center">
              <p className="ml-3 font-medium text-white truncate">
                <span className="hidden md:inline">{notification.message}</span>
              </p>
            </div>
            {notification.action && (
              <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
                <button
                  onClick={() => {
                    notification.action.handler();
                    onDismiss(notification.id);
                  }}
                  className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50"
                >
                  {notification.action.label}
                </button>
              </div>
            )}
            <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-2">
              <button
                type="button"
                onClick={() => onDismiss(notification.id)}
                className="-mr-1 flex p-2 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const GV_Notification: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.notifications.messages);

  const handleDismiss = useCallback((id: string) => {
    dispatch(remove_notification(id));
  }, [dispatch]);

  const toastNotifications = useMemo(() => notifications.filter(n => n.type === 'toast'), [notifications]);
  const modalNotifications = useMemo(() => notifications.filter(n => n.type === 'modal'), [notifications]);
  const bannerNotifications = useMemo(() => notifications.filter(n => n.type === 'banner'), [notifications]);

  return (
    <>
      {/* Toast Notifications */}
      <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50">
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          <AnimatePresence>
            {toastNotifications.map((notification) => (
              <ToastNotification key={notification.id} notification={notification} onDismiss={handleDismiss} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal Notifications */}
      {modalNotifications.map((notification) => (
        <ModalNotification key={notification.id} notification={notification} onDismiss={handleDismiss} />
      ))}

      {/* Banner Notifications */}
      {bannerNotifications.map((notification) => (
        <BannerNotification key={notification.id} notification={notification} onDismiss={handleDismiss} />
      ))}
    </>
  );
};

export default React.memo(GV_Notification);