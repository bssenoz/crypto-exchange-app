import React from 'react'
import { Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import Onboarding from 'react-native-onboarding-swiper'


function OnboardingScreen({ navigation }) {

    const Done = ({ ...props }) => (
        <TouchableOpacity
            style={{ marginHorizontal: 10 }}
            {...props}
        >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2a2e34' }}>TAMAMLANDI</Text>
        </TouchableOpacity>
    );

    const Skip = ({ ...props }) => (
        <TouchableOpacity
            style={{ marginHorizontal: 10 }}
            {...props}
        >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2a2e34' }}>ATLA</Text>
        </TouchableOpacity>
    );

    const Next = ({ ...props }) => (
        <TouchableOpacity
            style={{ marginHorizontal: 10 }}
            {...props}
        >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2a2e34' }}>İLERLE</Text>
        </TouchableOpacity>
    );

    return (
        <Onboarding
            NextButtonComponent={Next}
            SkipButtonComponent={Skip}
            DoneButtonComponent={Done}
            bottomBarColor='#faf602'
            titleStyles={{
                color: '#faf602',
                fontWeight: 'bold',
                letterSpacing: 2
            }}
            subTitleStyles={{
                color: '#fafaaa'
            }}
            onSkip={() => navigation.navigate("Login")}
            onDone={() => navigation.navigate("Login")}
            pages={[
                {
                    backgroundColor: '#14181b',
                    image: <Image source={require('../assets/GirisSayfası.png')} style={{ width: 275, height: 275 }} />,
                    title: 'Hoş Geldiniz',
                    subtitle: 'Tüm kripto para birimlerinin fiyatlarını gerçek zamanlı, geçmiş zamanlı olarak takip edin',
                },
                {
                    backgroundColor: '#14181b',
                    image: <Image source={require('../assets/ProfilOlustur.png')} style={{ width: 275, height: 275 }} />,
                    title: 'Profil Oluştur',
                    subtitle: 'Yeni hesap oluşturun veya mevcut hesap ile giriş yapın',
                },
                {
                    backgroundColor: '#14181b',
                    image: <Image source={require('../assets/FavoriCoin.png')} style={{ width: 275, height: 275, }} />,
                    title: 'Favori Coinler',
                    subtitle: 'Favori coinlerinizi favori listenize ekleyin',
                }
            ]}
        />
    )
}

export default OnboardingScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'gray'
    }
})