import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/config";

export const uploadImage = async (file: File, path: string): Promise<string> => {
    if (!storage) {
        throw new Error("Firebase storage is not initialized.");
    }
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
};
