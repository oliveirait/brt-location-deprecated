import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home } from "../screens/home";
import { Monitoring } from "../screens/monitoring";

const { Navigator, Screen } = createNativeStackNavigator();

export function AppRoutes( ) {
  return (
      <Navigator screenOptions={ {headerShown: false, orientation: 'portrait' }  }>
        <Screen name="home" component={Home}/>
        <Screen name="monitoring" component={Monitoring}  />
      </Navigator>
  );
}