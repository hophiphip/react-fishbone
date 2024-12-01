import Fishbone from "@hophiphip/react-fishbone";
import "@hophiphip/react-fishbone/style.css";

function App() {
    return (
        <Fishbone
            items={{
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
            }}
        />
    );
}

export default App;
