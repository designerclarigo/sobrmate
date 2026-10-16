import React from 'react';
import { View } from 'react-native';
import { Button, Text, colors } from '../design-system';
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <View style={{ flex: 1, padding: 28, justifyContent: 'center', gap: 20, backgroundColor: colors.background.canvas }}>
      <Text variant="display" serif>Let’s take a breath.</Text><Text color="secondary">Something interrupted this screen. Your saved journey is still on this device.</Text>
      <Button label="Open again" onPress={() => this.setState({ failed: false })} />
    </View>;
    return this.props.children;
  }
}
