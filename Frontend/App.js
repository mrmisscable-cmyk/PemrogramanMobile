import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function Kartu({ item, onHapus, isDarkMode }) {
  const formattedDate = item.tanggal
    ? new Date(item.tanggal).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '-';

  return (
    <View style={[styles.cardContainer, isDarkMode && styles.cardContainerDark]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.cardTitle, isDarkMode && styles.textLight]}>{item.judul}</Text>
        <Text style={[styles.cardCategory, isDarkMode && styles.textSubLight]}>
          Tanggal: {formattedDate}
        </Text>
        <Text style={styles.cardAmount}>
          Rp {item.nominal ? item.nominal.toLocaleString('id-ID') : 0}
        </Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => onHapus(item.id)}>
        <Text style={styles.deleteButtonText}>Hapus</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  const [items, setItems] = useState([]);
  const [judul, setJudul] = useState('');
  const [nominal, setNominal] = useState('');

  // Fitur Search
  const [searchQuery, setSearchQuery] = useState('');

  // Fitur Mode Gelap (Dark Mode)
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadData();
    loadTheme();
  }, []);

  const loadData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@pengeluaran_key');
      if (jsonValue != null) {
        setItems(JSON.parse(jsonValue));
      } else {
        const initialData = [
          { id: 1, judul: 'Makan siang', nominal: 20000, tanggal: new Date().toISOString() },
          { id: 2, judul: 'Bensin', nominal: 15000, tanggal: new Date().toISOString() },
        ];
        setItems(initialData);
      }
    } catch (e) {
      Alert.alert('Error', 'Gagal memuat data!');
    }
  };

  const saveData = async (newItems) => {
    try {
      await AsyncStorage.setItem('@pengeluaran_key', JSON.stringify(newItems));
    } catch (e) {
      Alert.alert('Error', 'Gagal menyimpan data!');
    }
  };

  const loadTheme = async () => {
    try {
      const themeValue = await AsyncStorage.getItem('@theme_key');
      if (themeValue !== null) {
        setIsDarkMode(JSON.parse(themeValue));
      }
    } catch (e) {
      console.log('Error loading theme');
    }
  };

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await AsyncStorage.setItem('@theme_key', JSON.stringify(newMode));
    } catch (e) {
      console.log('Error saving theme');
    }
  };

  function tambah() {
    if (!judul.trim() || !nominal.toString().trim()) {
      Alert.alert('Peringatan', 'Judul dan nominal harus diisi!');
      return;
    }

    const nilaiNominal = Number(nominal);
    if (isNaN(nilaiNominal)) {
      Alert.alert('Error', 'Nominal harus berupa angka!');
      return;
    }

    const lastId = items.length > 0 ? Math.max(...items.map((x) => x.id)) : 0;
    const newItem = {
      id: lastId + 1,
      judul: judul.trim(),
      nominal: nilaiNominal,
      tanggal: new Date().toISOString(),
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    saveData(updatedItems);

    setJudul('');
    setNominal('');
  }

  function hapusItem(id) {
    Alert.alert('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus pengeluaran ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          const updatedItems = items.filter((item) => item.id !== id);
          setItems(updatedItems);
          saveData(updatedItems);
        },
      },
    ]);
  }

  // Filter Data berdasarkan Search Nama
  const filteredItems = items.filter((item) =>
    item.judul.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Menghitung Total Pengeluaran
  const totalPengeluaran = filteredItems.reduce((total, item) => total + (item.nominal || 0), 0);

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <Kartu item={item} onHapus={hapusItem} isDarkMode={isDarkMode} />}
        ListHeaderComponent={
          <>
            {/* Header & Toggle Dark Mode */}
            <View style={styles.headerRow}>
              <Text style={[styles.title, isDarkMode && styles.textLight]}>Pengeluaran Lokal</Text>
              <View style={styles.darkModeSwitch}>
                <Text style={[styles.switchLabel, isDarkMode && styles.textLight]}>
                  {isDarkMode ? '🌙' : '☀️'}
                </Text>
                <Switch value={isDarkMode} onValueChange={toggleTheme} />
              </View>
            </View>

            {/* Identitas Pengguna */}
            <View style={[styles.identityContainer, isDarkMode && styles.cardContainerDark]}>
              <Text style={[styles.identityText, isDarkMode && styles.textLight]}>
                Nama: Mochammad Hanafi
              </Text>
              <Text style={[styles.identityText, isDarkMode && styles.textLight]}>
                NIM: 09020625052
              </Text>
            </View>

            {/* Total Pengeluaran */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Pengeluaran:</Text>
              <Text style={styles.totalValue}>Rp {totalPengeluaran.toLocaleString('id-ID')}</Text>
            </View>

            {/* Form Input Data Baru */}
            <TextInput
              value={judul}
              onChangeText={setJudul}
              placeholder="Judul pengeluaran"
              placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
              style={[styles.input, isDarkMode && styles.inputDark]}
            />

            <TextInput
              value={nominal}
              onChangeText={setNominal}
              placeholder="Nominal pengeluaran (contoh: 10000)"
              placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
              keyboardType="numeric"
              style={[styles.input, isDarkMode && styles.inputDark]}
            />

            <Button title="Tambah Pengeluaran" onPress={tambah} color="#00796b" />

            <View style={styles.divider} />

            {/* Pencarian */}
            <Text style={[styles.sectionTitle, isDarkMode && styles.textLight]}>Pencarian</Text>

            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="🔍 Cari nama pengeluaran..."
              placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
              style={[styles.input, isDarkMode && styles.inputDark]}
            />

            <Text style={[styles.sectionTitle, { marginTop: 12 }, isDarkMode && styles.textLight]}>
              Daftar Catatan:
            </Text>
          </>
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, isDarkMode && styles.textLight]}>
            Tidak ada pengeluaran yang cocok.
          </Text>
        }
        style={{ marginTop: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#e0f7fa',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  darkModeSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 18,
    marginRight: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#004d40',
  },
  textLight: {
    color: '#ffffff',
  },
  textSubLight: {
    color: '#bbb',
  },
  identityContainer: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  identityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004d40',
  },
  totalContainer: {
    backgroundColor: '#004d40',
    padding: 14,
    borderRadius: 8,
    marginBottom: 14,
  },
  totalLabel: {
    color: '#ffffff',
    fontSize: 12,
  },
  totalValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#b2dfdb',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    color: '#000000',
  },
  inputDark: {
    backgroundColor: '#1e1e1e',
    borderColor: '#333',
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 6,
    color: '#004d40',
  },
  divider: {
    height: 1,
    backgroundColor: '#b2dfdb',
    marginVertical: 14,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  cardContainerDark: {
    backgroundColor: '#1e1e1e',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#004d40',
  },
  cardCategory: {
    fontSize: 11,
    color: '#666666',
    marginVertical: 2,
  },
  cardAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d32f2f',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ef5350',
  },
  deleteButtonText: {
    color: '#c62828',
    fontWeight: 'bold',
    fontSize: 11,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 15,
    color: '#004d40',
  },
});