import React, { useState, useEffect } from "react";
import { useSocket } from "@/context/SocketProvider";
// import { useSession } from "next-auth/react";

export const ChatDebugger = () => {
  // Temporarily disabled session to fix React hooks error
  // const { data: session } = useSession();
  const session = { user: { id: "test-user-id", name: "Test User" } }; // Mock session
  const socket = useSocket();
  const [socketConnected, setSocketConnected] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      const socketInstance = window.socket;
      
      if (socketInstance) {
        setSocketConnected(socketInstance.connected);
        addLog(`Socket instance found, connected: ${socketInstance.connected}`);
        
        socketInstance.on('connect', () => {
          setSocketConnected(true);
          addLog('Socket connected');
        });
        
        socketInstance.on('disconnect', () => {
          setSocketConnected(false);
          addLog('Socket disconnected');
        });
        
        socketInstance.on('message_received', (data: any) => {
          addLog(`Message received: ${JSON.stringify(data)}`);
        });
      } else {
        addLog('No socket instance found on window');
      }
    }
  }, []);

  const sendTestMessage = async () => {
    if (!testMessage.trim()) return;
    
    addLog(`Attempting to send message: ${testMessage}`);
    
    try {
      // Test API endpoint
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: 'test-conversation',
          content: testMessage,
          messageType: "TEXT",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        addLog(`API call successful: ${JSON.stringify(data)}`);
      } else {
        const errorText = await response.text();
        addLog(`API call failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      addLog(`API call error: ${error}`);
    }

    // Test socket emission
    try {
      if (typeof window !== 'undefined') {
        // @ts-ignore
        const socketInstance = window.socket;
        if (socketInstance) {
          socketInstance.emit('send_message', {
            conversationId: 'test-conversation',
            content: testMessage,
            messageType: "TEXT",
          });
          addLog('Socket message emitted');
        } else {
          addLog('No socket instance for emission');
        }
      }
    } catch (error) {
      addLog(`Socket emission error: ${error}`);
    }

    setTestMessage("");
  };

  return (
    <div className="fixed top-4 right-4 w-96 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 z-50 max-h-96 overflow-y-auto">
      <h3 className="font-bold text-lg mb-4">Chat Debugger</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Session:</strong> {session?.user?.name || 'Not logged in'}
        </div>
        <div>
          <strong>Socket Connected:</strong> 
          <span className={socketConnected ? 'text-green-600' : 'text-red-600'}>
            {socketConnected ? ' Yes' : ' No'}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <input
          type="text"
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="Test message"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
          onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
        />
        <button
          onClick={sendTestMessage}
          className="mt-2 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Send Test Message
        </button>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold mb-2">Debug Logs:</h4>
        <div className="max-h-32 overflow-y-auto bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs">
          {debugLogs.map((log, index) => (
            <div key={index} className="mb-1">{log}</div>
          ))}
        </div>
        <button
          onClick={() => setDebugLogs([])}
          className="mt-2 text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
        >
          Clear Logs
        </button>
      </div>
    </div>
  );
};
