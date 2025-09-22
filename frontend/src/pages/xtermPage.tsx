import Xterm from "../components/xterm";

export default function XtermPage() {
    return <>
    <div className="h-[100vh]">
        <Xterm host="http://localhost:1234" />
    </div>
    </>
}