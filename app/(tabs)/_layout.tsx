import {Tabs} from "expo-router";
import {tabs} from "@/constants/data";
import { View, Image } from "react-native";
import clsx from "clsx";

const TabLayout = () => {
    const TabIcon = ({focused, icon}: TabIconProps) => {
        return (
            <View className="tabs-icon">
                <View className={clsx('tabs-pill', focused && 'tabs-active')}>
                    <Image source={icon} className="tabs-glyph"/>
                </View>
            </View>
        )
    };

    return (
        <Tabs screenOptions={{headerShown: false, tabBarActiveTintColor: '#800000'}}>
            {tabs.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{ title: tab.title,tabBarIcon: ({focused}) => (
                            <TabIcon focused={focused} icon={tab.icon}/>
                        )
                    }}/>
            ))}
        </Tabs>
    );
};

export default TabLayout;