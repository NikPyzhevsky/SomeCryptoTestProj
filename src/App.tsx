import React from 'react';
import './App.css';

import Web3 from 'web3'
import {Web3ReactProvider} from '@web3-react/core'
import {MetaMaskProvider} from "./hooks";
import {MainPage} from "./screens";

const getLibrary: (provider?: any) => any = (provider) => new Web3(provider)

function App() {
    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            <MetaMaskProvider>
                <MainPage/>
            </MetaMaskProvider>
        </Web3ReactProvider>
    );
}

export default App;
