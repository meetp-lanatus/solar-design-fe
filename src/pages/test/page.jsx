import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import Invertor from '../../assets/icons/Invertor.svg';
import { StepperForm } from './StepperForm';

// ------------------ Custom Inverter Node ------------------
function InverterNode({ data }) {
  return (
    <div
      onClick={data.onClick}
      className="relative p-3 bg-yellow-100 border-2 border-yellow-500 rounded-lg shadow-md flex flex-col items-center cursor-pointer hover:bg-yellow-200 transition"
    >
      {/* ✅ Handles for connecting */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <img src={Invertor} alt="Invertor" className="w-16 h-16" />
      <p className="text-sm font-semibold mt-1">{data.label}</p>
    </div>
  );
}

// ------------------ Custom Solar Panel Node ------------------
function PanelNode({ data }) {
  return (
    <div className="relative w-28 h-16 bg-blue-500 border-2 border-blue-700 rounded-md shadow-sm flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-blue-600 transition">
      {/* ✅ Handles for connecting panel-to-panel or panel-to-inverter */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      {data.label}
    </div>
  );
}

// ------------------ Main Flow Component ------------------
export const Test = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Progress percentage
  const progress = (step / 3) * 100;
  //   const nodeTypes = {
  //     inverter: InverterNode,
  //     panel: PanelNode,
  //   };

  //   const [nodes, setNodes, onNodesChange] = useNodesState([]);
  //   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  //   const [selectedElement, setSelectedElement] = useState(null);

  //   // ✅ Handle new connections
  //   const onConnect = useCallback(
  //     (params) =>
  //       setEdges((eds) => addEdge({ ...params, animated: true, style: { strokeWidth: 2 } }, eds)),
  //     [setEdges]
  //   );

  //   // ✅ Add Inverter
  //   const handleAddInverter = () => {
  //     const newId = `inverter-${nodes.length + 1}`;
  //     const newNode = {
  //       id: newId,
  //       type: 'inverter',
  //       position: { x: Math.random() * 400 + 300, y: Math.random() * 200 + 100 },
  //       data: { label: `Inverter ${nodes.length + 1}` },
  //     };
  //     setNodes((prev) => [...prev, newNode]);
  //   };

  //   // ✅ Add Panel
  //   const handleAddPanel = () => {
  //     const newId = `panel-${nodes.length + 1}`;
  //     const newNode = {
  //       id: newId,
  //       type: 'panel',
  //       position: { x: Math.random() * 400 + 100, y: Math.random() * 200 + 300 },
  //       data: { label: `Panel ${nodes.length + 1}` },
  //     };
  //     setNodes((prev) => [...prev, newNode]);
  //   };

  //   // ✅ Delete selected node or edge with Delete key
  //   useEffect(() => {
  //     const handleKeyDown = (e) => {
  //       if (e.key === 'Delete' && selectedElement) {
  //         if (selectedElement.type === 'edge') {
  //           setEdges((eds) => eds.filter((edge) => edge.id !== selectedElement.id));
  //         } else {
  //           setNodes((nds) => nds.filter((node) => node.id !== selectedElement.id));
  //           setEdges((eds) =>
  //             eds.filter(
  //               (edge) => edge.source !== selectedElement.id && edge.target !== selectedElement.id
  //             )
  //           );
  //         }
  //         setSelectedElement(null);
  //       }
  //     };

  //     window.addEventListener('keydown', handleKeyDown);
  //     return () => window.removeEventListener('keydown', handleKeyDown);
  //   }, [selectedElement, setNodes, setEdges]);

  //   // ✅ Track selected node or edge
  //   const onSelectionChange = useCallback(({ nodes, edges }) => {
  //     if (nodes.length > 0) setSelectedElement(nodes[0]);
  //     else if (edges.length > 0) setSelectedElement(edges[0]);
  //     else setSelectedElement(null);
  //   }, []);

  return (
    // <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
    //   {/* Progress Bar */}
    //   <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
    //     <div
    //       className="bg-blue-500 h-2 rounded-full transition-all duration-300"
    //       style={{ width: `${progress}%` }}
    //     ></div>
    //   </div>
    //   <p className="text-sm mb-4">Step {step} of 3</p>

    //   {/* Step 1 */}
    //   {step === 1 && (
    //     <div>
    //       <h2 className="text-xl font-semibold mb-4">Step 1: Name</h2>
    //       <input
    //         type="text"
    //         name="name"
    //         value={formData.name}
    //         onChange={handleChange}
    //         className="w-full border p-2 rounded mb-4"
    //         placeholder="Enter your name"
    //       />
    //       <button onClick={handleNext} className="bg-blue-500 text-white px-4 py-2 rounded">
    //         Next
    //       </button>
    //     </div>
    //   )}

    //   {/* Step 2 */}
    //   {step === 2 && (
    //     <div>
    //       <h2 className="text-xl font-semibold mb-4">Step 2: Email</h2>
    //       <input
    //         type="email"
    //         name="email"
    //         value={formData.email}
    //         onChange={handleChange}
    //         className="w-full border p-2 rounded mb-4"
    //         placeholder="Enter your email"
    //       />
    //       <div className="flex justify-between">
    //         <button onClick={handleBack} className="bg-gray-500 text-white px-4 py-2 rounded">
    //           Back
    //         </button>
    //         <button onClick={handleNext} className="bg-blue-500 text-white px-4 py-2 rounded">
    //           Next
    //         </button>
    //       </div>
    //     </div>
    //   )}

    //   {/* Step 3 */}
    //   {step === 3 && (
    //     <div>
    //       <h2 className="text-xl font-semibold mb-4">Step 3: Password</h2>
    //       <input
    //         type="password"
    //         name="password"
    //         value={formData.password}
    //         onChange={handleChange}
    //         className="w-full border p-2 rounded mb-4"
    //         placeholder="Enter your password"
    //       />
    //       <div className="flex justify-between">
    //         <button onClick={handleBack} className="bg-gray-500 text-white px-4 py-2 rounded">
    //           Back
    //         </button>
    //         <button
    //           onClick={() => alert(JSON.stringify(formData))}
    //           className="bg-green-500 text-white px-4 py-2 rounded"
    //         >
    //           Submit
    //         </button>
    //       </div>
    //     </div>
    //   )}
    // </div>
    <StepperForm />
    // <div className="flex flex-col items-center">
    //   {/* 🔹 Top toolbar for adding components */}
    //   <div className="flex gap-3 mb-4">
    //     <button
    //       onClick={handleAddInverter}
    //       className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded shadow"
    //     >
    //       ➕ Add Inverter
    //     </button>
    //     <button
    //       onClick={handleAddPanel}
    //       className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded shadow"
    //     >
    //       ➕ Add Panel
    //     </button>
    //   </div>

    //   {/* 🔹 React Flow Canvas */}
    //   <div style={{ width: '90%', height: '600px', border: '1px solid #ccc' }}>
    //     <ReactFlow
    //       nodes={nodes}
    //       edges={edges}
    //       onNodesChange={onNodesChange}
    //       onEdgesChange={onEdgesChange}
    //       onConnect={onConnect}
    //       onSelectionChange={onSelectionChange}
    //       nodeTypes={nodeTypes}
    //       fitView
    //       connectionMode={ConnectionMode.Loose}
    //     >
    //       <MiniMap />
    //       <Background />
    //       <Controls />
    //     </ReactFlow>
    //   </div>
    // </div>
  );
};
