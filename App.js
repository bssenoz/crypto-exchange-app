import React from "react";
import Providers from "./navigation";
import * as Notifications from "expo-notifications";
import { LogBox } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowAlert: true,
    };
  },
});

const App = () => {
  LogBox.ignoreAllLogs();
  return <Providers />;
};

export default App;
