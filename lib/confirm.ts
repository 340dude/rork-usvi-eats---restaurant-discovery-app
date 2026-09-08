import { Alert, Platform } from 'react-native';

// Alert.alert's multi-button form is a no-op on react-native-web, so this
// branches to a real browser confirm() there instead.
export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel: string = 'Confirm'
) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
