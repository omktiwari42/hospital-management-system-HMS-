import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import api from "../services/api";



export default function LoginScreen() {
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const sendOTP = async () => {
        try {
            console.log("START");

            const response = await api.post(
                "/send-otp",
                {
                    phone: `+91${phone}`,
                }
            );

            console.log("SUCCESS:", response.data);

            Alert.alert(
                "SUCCESS",
                JSON.stringify(response.data)
            );
        } catch (error: any) {
            console.log("ERROR MESSAGE:", error?.message);
            console.log("ERROR DATA:", error?.response?.data);
            console.log("FULL ERROR:", JSON.stringify(error));

            Alert.alert(
                "ERROR",
                error?.response?.data?.message ||
                error?.message ||
                "Unknown Error"
            );
        }
    };
    const verifyOTP = async () => {
        try {
            const response = await api.post(
                "/verify-otp",
                {
                    phone: `+91${phone}`,
                    otp: otp,
                }
            );

            console.log("VERIFY SUCCESS:", response.data);

            router.push("/dashboard");

        } catch (error: any) {
            Alert.alert(
                "Error",
                error?.response?.data?.message ||
                "Invalid OTP"
            );
        }
    }; return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.logo}>🏥</Text>

                <Text style={styles.title}>
                    Hospital Management{"\n"}System
                </Text>

                <Text style={styles.subtitle}>
                    Secure OTP Login
                </Text>

                <Text style={styles.label}>Phone Number</Text>

                <View style={styles.phoneRow}>
                    <View style={styles.countryCode}>
                        <Text>🇮🇳 +91</Text>
                    </View>

                    <TextInput
                        placeholder="Phone Number"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                        style={styles.phoneInput}
                    />
                </View>

                <TouchableOpacity
                    style={styles.sendBtn}
                    onPress={sendOTP}
                >
                    <Text style={styles.btnText}>
                        📩 Send OTP
                    </Text>
                </TouchableOpacity>

                <Text style={styles.label}>Enter OTP</Text>

                <TextInput
                    placeholder="Enter OTP"
                    keyboardType="number-pad"
                    value={otp}
                    onChangeText={setOtp}
                    style={styles.otpInput}
                />

                <TouchableOpacity
                    style={styles.verifyBtn}
                    onPress={verifyOTP}
                >
                    <Text style={styles.btnText}>
                        🔐 Verify OTP
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#edf3f8",
        justifyContent: "center",
        padding: 20,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 25,
        elevation: 6,
    },
    logo: {
        fontSize: 40,
        textAlign: "center",
    },
    title: {
        fontSize: 30,
        fontWeight: "700",
        color: "#1e3a8a",
        textAlign: "center",
        marginTop: 10,
    },
    subtitle: {
        textAlign: "center",
        color: "#777",
        marginTop: 8,
        marginBottom: 25,
    },
    label: {
        fontWeight: "600",
        marginBottom: 8,
        color: "#111",
    },
    phoneRow: {
        flexDirection: "row",
        marginBottom: 15,
    },
    countryCode: {
        width: 85,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    phoneInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
    },
    otpInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        marginBottom: 15,
    },
    sendBtn: {
        backgroundColor: "#10b981",
        height: 52,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    verifyBtn: {
        backgroundColor: "#2563eb",
        height: 52,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    btnText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
});