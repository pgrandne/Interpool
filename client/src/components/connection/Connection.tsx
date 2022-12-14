import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
function Connection() {
    const { isDisconnected } = useAccount()

    if (isDisconnected) {
        return (
            <div
                style={{
                    border: '2px solid',
                    // lineHeight: "21px",
                    textDecoration: "none",
                    // borderColor: "#000",
                    borderRadius: "25px",
                    // color: "#000",
                }}
            >
                <ConnectButton label="Connect" />
            </div >
        )
    } else {
        return (
            <div>
                <ConnectButton />
            </div >)
    };
};

export default Connection;