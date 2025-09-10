import CustomButton from "@/components/CustomButton";
import "../../global.css";
import InputField from "@/components/InputField";
import { icons, images } from "@/constants";
import { useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { Link, router } from "expo-router";
import OAuth from "@/components/OAuth";
import { useSignUp } from "@clerk/clerk-expo";
import ReactNativeModal from "react-native-modal";


const SignUp = () => {
    const { isLoaded, signUp, setActive } = useSignUp()
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [verification, setVerification] = useState({
        code: '',
        error: '',
        state: 'default'
    });
    const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setVerification({
        ...verification,
        state: "pending"
      })
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
      Alert.alert("Error", err.errors[0].longMessage)
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      })

      if (signUpAttempt.status === 'complete') {
        // TODO: Create a user in db
        await setActive({ session: signUpAttempt.createdSessionId })
        setVerification({ ...verification, state: "success" })
    } else {
        setVerification({ ...verification, state: "failed", error: "Verification failed" })
      }
    } catch (err) {
      setVerification({ ...verification, state: "failed", error: err.errors[0].longMessage })
    }
  }

    return(
        <ScrollView className="flex-1 bg-white">
            <View className="flex-1 bg-white">
                <View className="relative w-full h-[250px]">
                    <Image 
                        source={images.signUpCar}
                        className="z-0 w-full h-64"
                    />
                    <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">Create Your Account</Text>
                </View>

                <View className="p-5">
                    <InputField 
                        label="Name"
                        icon={icons.person}
                        placeholder="Enter your name"
                        value={form.name}
                        onChangeText={(value) => setForm({ ...form, name: value })}
                    />
                    <InputField 
                        label="Email"
                        icon={icons.person}
                        placeholder="Enter your email"
                        value={form.email}
                        onChangeText={(value) => setForm({ ...form, email: value })}
                    />
                    <InputField 
                        label="Password"
                        icon={icons.lock}
                        placeholder="Enter your password"
                        secureTextEntry={true}
                        value={form.password}
                        onChangeText={(value) => setForm({ ...form, password: value })}
                    />

                    <CustomButton 
                        title="Sign Up"
                        className="mt-6"
                        onPress={onSignUpPress}
                    />

                    <OAuth />

                    <Link href={"/sign-in"} className="text-lg text-center text-general-200 mt-10">
                        <Text>Already have an account? </Text>
                        <Text className="text-primary-500">Log In</Text>
                    </Link>
                </View>

                {/* Pending Modal */}
                <ReactNativeModal 
                    isVisible={verification.state === 'pending'} 
                    onModalHide={() => {
                        if(verification.state === 'success') setShowSuccessModal(true)
                    }}
                >
                    <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
                        <Text className="text-2xl font-JakartaSemiBold mb-2">
                            Verification
                        </Text>
                        <Text className="font-Jakarta mb-5">
                            We've sent a verification code to {form.email}
                        </Text>

                        <InputField 
                            label="Code"
                            icon={icons.lock}
                            placeholder="12345"
                            value={verification.code}
                            keyboardType="numeric"
                            onChangeText={(value) => setVerification({ ...verification, code: value })}
                        />

                        {verification.error && (
                            <Text className="text-red-500 text-sm mt-1">
                                {verification.error}
                            </Text>
                        )}

                        <CustomButton 
                            title="Verify Email"
                            onPress={onVerifyPress}
                            className="mt-5 bg-success-500"
                        />
                    </View>
                </ReactNativeModal>

                {/* Verification Modal */}
                <ReactNativeModal isVisible={showSuccessModal}>
                    <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
                        <Image source={images.check} className="w-[110px] h-[110px] mx-auto my-5" />
                        <Text className="text-center font-JakartaBold text-3xl">
                            Verified
                        </Text>
                        <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
                            You have successfully verified your account.
                        </Text>
                        <CustomButton 
                            title="Continue"
                            onPress={() => {
                                setShowSuccessModal(false);
                                router.replace('/(root)/(tabs)/home');
                            }}
                            className="mt-5"
                        />
                    </View>
                </ReactNativeModal>
            </View>
        </ScrollView>
    )
}

export default SignUp;