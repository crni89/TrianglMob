import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";

const LoaderComponent = ({ color = "#ed7d37" }) => {
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 4000,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.spinner, { borderTopColor: color, transform: [{ rotate: spin }] }]}>
                <Animated.View style={[styles.spinner, { borderTopColor: color, transform: [{ rotate: spin }] }]}>
                    <Animated.View style={[styles.spinner, { borderTopColor: color, transform: [{ rotate: spin }] }]}>
                        <Animated.View style={[styles.spinner, { borderTopColor: color, transform: [{ rotate: spin }] }]}>
                            <Animated.View style={[styles.spinner, { borderTopColor: color, transform: [{ rotate: spin }] }]} />
                        </Animated.View>
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 100,
        height: 100,
        justifyContent: "center",
        alignItems: "center",
    },
    spinner: {
        position: "absolute",
        width: 90, // Umesto calc(100% - 9.9px)
        height: 90,
        borderWidth: 3,
        borderColor: "transparent",
        borderRadius: 50,
    },
});

export default LoaderComponent;
