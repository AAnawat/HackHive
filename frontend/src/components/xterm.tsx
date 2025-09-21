import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { useEffect, useRef } from "react";

import "@xterm/xterm/css/xterm.css";


interface XtermInput {
    host: string
}

export default function Xterm({ host }: XtermInput) {
    const termRef = useRef(null);

    useEffect(() => {
        const fitAddon = new FitAddon()
        const term = new Terminal()
        term.loadAddon(fitAddon)
        
        term.open(termRef.current)
        fitAddon.fit()
        
        const handleResize = () => fitAddon.fit()
        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
            term.dispose()
        }
    }, [])

    return <div ref={termRef} className="h-full w-full"></div>
}
