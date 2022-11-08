import React from 'react';
import ReactDOM from 'react-dom/client';

import {
    LiveProvider,
    LiveEditor,
    LiveError,
    LivePreview
} from 'react-live';

import Fishbone from '../dist';
import '../dist/index.css';

import './index.css';

const scope = { Fishbone };

const code = `
    <Fishbone 
        items={{
            "name": "Quality",
            "children": [
                {
                    "name": "Machine",
                    "children": [
                    {"name": "Mill"},
                    {"name": "Mixer"},
                    {"name": "Metal Lathe"}
                    ]
                },
                {"name": "Method"},
                {
                    "name": "Material",
                    "children": [
                    {"name": "Masonite"},
                    {
                        "name": "Marscapone",
                        "children": [
                        {"name": "Malty"},
                        {
                            "name": "Minty",
                            "children": [
                            {"name": "spearMint"},
                            {"name": "pepperMint"}
                            ]
                        }
                        ]
                    },
                    {"name": "Meat",
                        "children": [
                        {"name": "Mutton"}
                        ]
                    }
                    ]
                },
                {
                    "name": "Man Power",
                    "children": [
                    {"name": "Manager"},
                    {"name": "Master's Student"},
                    {"name": "Magician"},
                    {"name": "Miner"},
                    {"name": "Magister", "children": [
                        {"name": "Malpractice"}
                    ]},
                    {
                        "name": "Massage Artist",
                        "children": [
                        {"name": "Masseur"},
                        {"name": "Masseuse"}
                        ]
                    }
                    ]
                },
                {
                    "name": "Measurement",
                    "children": [
                    {"name": "Malleability"}
                    ]
                },
                {
                    "name": "Milieu",
                    "children": [
                    {"name": "Marine"}
                    ]
                }
            ]
        }} 
        wrapperStyle={{ 
            width: '100%', 
            height: '100%' 
        }} 
    />
`;

const borderPx = 1;
const editorheightPx = 500 - borderPx;
const previewheightPx = `calc(100% - ${editorheightPx}px + ${borderPx})`;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <LiveProvider code={code} scope={scope}>
            <LiveEditor style={{ 
                height: editorheightPx, 
                overflow: 'auto',
                fontSize: '16px',
                whiteSpace: 'pre',
                background: '#322e3c',
                color: 'white',
            }}
            />
            <LiveError />
            <LivePreview style={{ 
                width: '100%', 
                overflow: 'auto', 
                height: 'calc(100% - 500px)',
                borderTop: '1px solid #eee' 
            }} 
            />
        </LiveProvider>
    </React.StrictMode>
);
