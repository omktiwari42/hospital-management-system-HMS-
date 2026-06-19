import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function Dashboard() {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.heading}>
                🏥 Hospital Management System
            </Text>

            <View style={styles.cardRow}>
                <View style={[styles.card, styles.blue]}>
                    <Text style={styles.cardTitle}>👨‍⚕️ Patients</Text>
                    <Text style={styles.cardValue}>1</Text>
                </View>

                <View style={[styles.card, styles.green]}>
                    <Text style={styles.cardTitle}>🩺 Doctors</Text>
                    <Text style={styles.cardValue}>1</Text>
                </View>
            </View>

            <View style={styles.cardRow}>
                <View style={[styles.card, styles.orange]}>
                    <Text style={styles.cardTitle}>📅 Appointments</Text>
                    <Text style={styles.cardValue}>1</Text>
                </View>

                <View style={[styles.card, styles.red]}>
                    <Text style={styles.cardTitle}>💳 Bills</Text>
                    <Text style={styles.cardValue}>1</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    📊 Appointment Status
                </Text>

                <Text style={styles.sectionText}>
                    Scheduled: 1
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    💰 Revenue Overview
                </Text>

                <Text style={styles.sectionText}>
                    ₹500
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    📅 Recent Appointments
                </Text>

                <View style={styles.tableRow}>
                    <Text>Om Tiwari</Text>
                </View>

                <View style={styles.tableRow}>
                    <Text>Dr. Ranjeet KR Tiwari</Text>
                </View>

                <View style={styles.tableRow}>
                    <Text>Scheduled</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    👨‍⚕️ Recent Patients
                </Text>

                <View style={styles.tableRow}>
                    <Text>Om Tiwari</Text>
                </View>

                <View style={styles.tableRow}>
                    <Text>8355001466</Text>
                </View>

                <View style={styles.tableRow}>
                    <Text>AB+</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.logoutBtn}>
                <Text style={styles.logoutText}>
                    Logout
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#edf3f8",
        padding: 15,
    },

    heading: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1e3a8a",
        marginBottom: 20,
    },

    cardRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
    },

    card: {
        width: "48%",
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        elevation: 4,
    },

    blue: {
        borderLeftWidth: 5,
        borderLeftColor: "#3b82f6",
    },

    green: {
        borderLeftWidth: 5,
        borderLeftColor: "#10b981",
    },

    orange: {
        borderLeftWidth: 5,
        borderLeftColor: "#f59e0b",
    },

    red: {
        borderLeftWidth: 5,
        borderLeftColor: "#ef4444",
    },

    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
    },

    cardValue: {
        fontSize: 28,
        fontWeight: "bold",
        marginTop: 10,
    },

    section: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 10,
    },

    sectionText: {
        fontSize: 16,
    },

    tableRow: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },

    logoutBtn: {
        backgroundColor: "#ef4444",
        height: 55,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 30,
    },

    logoutText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});