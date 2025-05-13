import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from '../screens/AuthScreen';
import LandingScreen from '../screens/LandingScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Auth">
      <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'Sign In / Sign Up' }} />
      <Stack.Screen name="Landing" component={LandingScreen} options={{ title: 'Welcome' }} />
    </Stack.Navigator>
  );
}