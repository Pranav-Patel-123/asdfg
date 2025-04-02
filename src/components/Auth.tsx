"use client";
import { useState, useEffect } from "react";
import { 
  auth, 
  googleProvider, 
  db 
} from "../config/firebaseConfig";
import { 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc 
} from "firebase/firestore";

export default function Auth() {
  const [user, setUser] = useState<any>(null);

  // Form State for Firestore user data
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | string>("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  // Note: 'email' below is used for user data. We use separate state for auth credentials.
  const [email, setEmail] = useState("");

  // Form State for Authentication (email & password)
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const [users, setUsers] = useState<any[]>([]);

  // Fetch Users on Login
  useEffect(() => {
    if (user) fetchUsers();
  }, [user]);

  // Google Login
  const googleLogin = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      setUser(userCredential.user);
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  // Email/Password Login
  const loginWithEmail = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, authEmail, authPassword);
      setUser(userCredential.user);
      // Optionally clear the auth form fields
      setAuthEmail("");
      setAuthPassword("");
    } catch (error) {
      console.error("Email login error:", error);
    }
  };

  // Email/Password Registration
  const registerWithEmail = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      setUser(userCredential.user);
      // Optionally clear the auth form fields
      setAuthEmail("");
      setAuthPassword("");
    } catch (error) {
      console.error("Email registration error:", error);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Add User to Firestore
  const addUser = async () => {
    if (!name || !age || !email || !phone || !address) {
      alert("Please fill all fields!");
      return;
    }
    try {
      await addDoc(collection(db, "users"), { name, age, email, phone, address });
      fetchUsers();
      resetForm();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  // Fetch Users from Firestore
  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Update User in Firestore
  const updateUser = async (id: string) => {
    const updatedName = prompt("Enter updated name:");
    const updatedAge = prompt("Enter updated age:");
    const updatedEmail = prompt("Enter updated email:");
    const updatedPhone = prompt("Enter updated phone:");
    const updatedAddress = prompt("Enter updated address:");

    if (!updatedName || !updatedAge || !updatedEmail || !updatedPhone || !updatedAddress) return;

    try {
      await updateDoc(doc(db, "users", id), {
        name: updatedName,
        age: updatedAge,
        email: updatedEmail,
        phone: updatedPhone,
        address: updatedAddress,
      });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  // Delete User from Firestore
  const deleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, "users", id));
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Reset Firestore Form Fields
  const resetForm = () => {
    setName("");
    setAge("");
    setEmail("");
    setPhone("");
    setAddress("");
  };

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-5xl p-12 rounded-2xl shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800">
        {!user ? (
          <div className="text-center space-y-8">
            <h1 className="text-5xl font-extrabold text-white">Login Options</h1>
            {/* Google Login */}
            <button
              onClick={googleLogin}
              className="w-full p-4 bg-red-600 hover:bg-red-700 rounded-lg text-lg transition duration-300"
            >
              Login with Google
            </button>

            {/* Toggle between Email Login and Registration */}
            <div className="space-y-4">
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setAuthMode("login")}
                  className={`p-2 ${authMode === "login" ? "bg-blue-600" : "bg-gray-600"} rounded-lg transition duration-300 text-white`}
                >
                  Login with Email
                </button>
                <button
                  onClick={() => setAuthMode("register")}
                  className={`p-2 ${authMode === "register" ? "bg-blue-600" : "bg-gray-600"} rounded-lg transition duration-300 text-white`}
                >
                  Register with Email
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="p-4 rounded-lg bg-gray-700 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="p-4 rounded-lg bg-gray-700 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {authMode === "login" ? (
                  <button
                    onClick={loginWithEmail}
                    className="w-full p-4 bg-green-600 hover:bg-green-700 rounded-lg text-lg transition duration-300"
                  >
                    Login
                  </button>
                ) : (
                  <button
                    onClick={registerWithEmail}
                    className="w-full p-4 bg-green-600 hover:bg-green-700 rounded-lg text-lg transition duration-300"
                  >
                    Register
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            <h2 className="text-4xl font-bold text-center text-white">
              Welcome, {user.displayName || user.email}
            </h2>

            <button
              onClick={logout}
              className="w-full p-4 bg-gray-600 hover:bg-gray-700 rounded-lg text-lg transition duration-300"
            >
              Logout
            </button>

            {/* Form to Add User Data to Firestore */}
            <h3 className="text-2xl font-semibold text-white">Add User Data</h3>
            <div className="grid grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-4 rounded-lg bg-gray-700 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <input
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="p-4 rounded-lg bg-gray-700 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-4 rounded-lg bg-gray-700 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <input
                type="tel"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="p-4 rounded-lg bg-gray-700 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="p-4 rounded-lg bg-gray-700 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <button
                onClick={addUser}
                className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg transition duration-300"
              >
                Add
              </button>
            </div>

            {/* User List */}
            <h3 className="text-2xl font-semibold text-white">User List</h3>
            <div className="space-y-6">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-4 p-6 bg-gray-700 rounded-lg"
                >
                  <span className="text-white text-lg">
                    {user.name} (Age: {user.age}) | Email: {user.email} | Phone: {user.phone} | Address: {user.address}
                  </span>
                  <div className="flex gap-4">
                    <button
                      onClick={() => updateUser(user.id)}
                      className="p-3 bg-yellow-500 hover:bg-yellow-600 rounded-lg transition duration-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="p-3 bg-red-600 hover:bg-red-700 rounded-lg transition duration-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
