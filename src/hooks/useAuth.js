import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Read the shared login state and actions.
export default function useAuth(){
    const context = useContext(AuthContext);

    if(context === null){
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}
