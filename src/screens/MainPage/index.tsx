import logo from "../../logo.svg";
import React from "react";
import {useMetaMask} from "../../hooks";

export const MainPage = () => {
    const {connect, disconnect, isActive, account} = useMetaMask()
    return (<div className="App">
        <header className="App-header">
            <img src={logo} className="App-logo" alt="logo"/>
            <p>
                {isActive ? `Connected account: ${account}` : 'have no connected account'}
            </p>
            <button onClick={isActive?disconnect:connect}>{isActive ? 'disconnect metamask':'connect to metamask'}</button>

        </header>
    </div>)
}
