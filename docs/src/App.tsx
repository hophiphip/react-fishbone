import Fishbone, { alteratingFishboneLayout, symmetricFishboneLayout, type FishboneNode } from "@hophiphip/react-fishbone";
import "@hophiphip/react-fishbone/style.css";
import { useState } from "react";

const items: FishboneNode = {
    label: "Root",
    children: [
        {
            label: "Node 1",
            children: [
                {
                    label: "Node 1-1",
                    children: [
                        {
                            label: "Node 1-1-1",
                        },
                    ],
                },
                {
                    label: "Node 1-2",
                },
                {
                    label: "Node 1-3",
                },
            ],
        },
        {
            label: "Node 2",
            children: [
                {
                    label: "Node 2-1",
                },
                {
                    label: "Node 2-2",
                },
                {
                    label: "Node 2-3",
                },
            ],
        },
        {
            label: "Node 3",
        },
        {
            label: "Node 4",
        },
        {
            label: "Node 5",
            children: [
                {
                    label: "Node 5-1",
                },
                {
                    label: "Node 5-2",
                },
                {
                    label: "Node 5-3",
                },
            ],
        },
    ],
};

/**
 * NOTE: onLayout somehow uses cached positions and re-draws invalid layout.
 * For now insted of passing different layout function - split different layouts into separate components. 
 */

const SymmetricFishbone = () => {
    return (
        <Fishbone
            layout={symmetricFishboneLayout}
            items={items}
        />
    );
};

const AlteraringFishbone = () => {
    return (
        <Fishbone
            layout={alteratingFishboneLayout}
            items={items}
        />
    );
};

function App() {
    const [layout, setLayout] = useState<'alterating' | 'symmetric'>('symmetric');

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
        }}>
            <div style={{ 
                display: 'flex',
                gap: '0.5rem',
                border: '1px solid #eee',
                boxSizing: 'border-box',
                padding: '0.25rem',
            }}>
                <label>
                    Fishbone layout function:

                    <select name="select-layout" value={layout} onChange={(event) => setLayout(event.target.value as typeof layout)}>
                        <option value="alterating">Alterating Layout</option>
                        <option value="symmetric">Symmetric Layout</option>
                    </select>
                </label>
            </div>

            <div style={{
                flex: '1 1 auto',
            }}>
                {layout === 'symmetric' ? <SymmetricFishbone /> : <AlteraringFishbone />}
            </div>
        </div>
    );
}

export default App;
