
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, Switch, StatusBar, SafeAreaView 
} from 'react-native';
import { parseIncomingSms } from './services/smsParser';
import { pushToBackend } from './services/api';
import { AppConfig } from './types';

export default function App() {
  const [config, setConfig] = useState<AppConfig>({
    apiUrl: 'https://sms-backend-production-cad9.up.railway.app',
    userId: '',
    secret: '',
    isActive: true
  });
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 20));
  };

  // Mocking an incoming SMS for demonstration/testing in UI
  const testTrigger = async () => {
    const body = "Rs. 1250 debited at Zomato. Ref: 12345";
    const sender = "HDFCBNK";
    addLog(`Simulated SMS from ${sender}`);
    
    const parsed = parseIncomingSms(body, sender);
    if (parsed) {
      addLog(`Parsed: ₹${parsed.amount} at ${parsed.description}`);
      try {
        await pushToBackend(config, parsed);
        addLog("✅ Push successful");
      } catch (e: any) {
        addLog(`❌ Push failed: ${e.message}`);
      }
    } else {
      addLog("⚠️ Ignored (Non-transactional)");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>MoneyOS Bridge</Text>
        <Text style={styles.subtitle}>SECURE EDGE NODE</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.statusRow}>
          <Text style={styles.label}>SYSTEM ENGINE</Text>
          <View style={styles.flexRow}>
            <Text style={[styles.statusText, {color: config.isActive ? '#10b981' : '#ef4444'}]}>
              {config.isActive ? 'RUNNING' : 'PAUSED'}
            </Text>
            <Switch 
              value={config.isActive} 
              onValueChange={(v) => setConfig({...config, isActive: v})}
              trackColor={{ false: "#334155", true: "#3b82f6" }}
              thumbColor="#f8fafc"
            />
          </View>
        </View>

        <Text style={styles.inputLabel}>RAILWAY CORE ENDPOINT</Text>
        <TextInput 
          style={styles.input} 
          value={config.apiUrl} 
          onChangeText={(t) => setConfig({...config, apiUrl: t})}
          placeholder="https://..."
          placeholderTextColor="#475569"
        />

        <Text style={styles.inputLabel}>USER TARGET ID</Text>
        <TextInput 
          style={styles.input} 
          value={config.userId} 
          onChangeText={(t) => setConfig({...config, userId: t})}
          placeholder="MongoDB User Object ID"
          placeholderTextColor="#475569"
        />

        <Text style={styles.inputLabel}>HANDSHAKE SECRET</Text>
        <TextInput 
          style={styles.input} 
          value={config.secret} 
          onChangeText={(t) => setConfig({...config, secret: t})}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#475569"
        />

        <TouchableOpacity style={styles.testBtn} onPress={testTrigger}>
          <Text style={styles.testBtnText}>SIMULATE INCOMING TRANSACTION</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.logHeader}>KERNEL LOGS</Text>
      <View style={styles.logWrapper}>
        <ScrollView style={styles.logContainer}>
          {logs.map((log, i) => (
            <Text key={i} style={styles.logText}>{log}</Text>
          ))}
          {logs.length === 0 && <Text style={styles.emptyLog}>System operational. Waiting for edge events...</Text>}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', paddingHorizontal: 20 },
  header: { marginTop: 40, marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '900', color: '#f8fafc', letterSpacing: -1 },
  subtitle: { fontSize: 10, color: '#3b82f6', fontWeight: 'bold', letterSpacing: 2 },
  card: { backgroundColor: '#1e293b', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#334155', elevation: 10 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  flexRow: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 10, fontWeight: 'bold', color: '#64748b' },
  statusText: { fontSize: 12, fontWeight: 'bold', marginRight: 12 },
  inputLabel: { fontSize: 9, fontWeight: '900', color: '#94a3b8', marginBottom: 6, marginTop: 14, letterSpacing: 1 },
  input: { backgroundColor: '#0f172a', borderRadius: 12, padding: 14, color: '#f8fafc', fontSize: 14, borderBottomWidth: 2, borderBottomColor: '#334155' },
  testBtn: { backgroundColor: '#0f172a', borderRadius: 12, padding: 12, marginTop: 24, alignItems: 'center', borderWidth: 1, borderColor: '#3b82f633' },
  testBtnText: { color: '#3b82f6', fontWeight: 'bold', fontSize: 10 },
  logHeader: { fontSize: 10, fontWeight: 'bold', color: '#475569', marginTop: 32, marginBottom: 8, letterSpacing: 1 },
  logWrapper: { flex: 1, backgroundColor: '#020617', borderRadius: 16, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#1e293b' },
  logContainer: { flex: 1 },
  logText: { color: '#94a3b8', fontSize: 11, fontFamily: 'monospace', marginBottom: 6, lineHeight: 16 },
  emptyLog: { color: '#334155', fontSize: 12, textAlign: 'center', marginTop: 40, fontStyle: 'italic' }
});
