// index.ts
import 'react-native-gesture-handler';  // <-- first line
import 'react-native-reanimated';       // keep this early
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
