import React, {createContext, FC, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {useWeb3React} from "@web3-react/core";
import {InjectedConnector} from "@web3-react/injected-connector";

export const MetaMaskContext = createContext<null | any>(null)
export const injected = new InjectedConnector({supportedChainIds: [1]})

export const MetaMaskProvider: FC<{ children: ReactNode }> = ({children}) => {
    const {active, account, deactivate, activate} = useWeb3React()

    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(true)

    const connect = useCallback(async () => {
        console.log('Connecting to MetaMask Wallet ')

        try {
            await activate(injected)
        } catch (error) {
            console.log('Error on connecting: ', error)
        }
    }, [activate])

    const disconnect = useCallback(async () => {
        console.log('Deactivating...')
        try {
            await deactivate()
        } catch (error) {
            console.log('Error on disconnecting: ', error)
        }
    }, [deactivate])

    const handleIsActive = useCallback(() => {
        setIsActive(active)
    }, [active])

    useEffect(() => {
        connect().then(() => {
            setIsLoading(false)
        })
    }, [connect])


    useEffect(() => {
        handleIsActive()
    }, [handleIsActive])

    const values = useMemo(
        () => ({
            isActive,
            account,
            isLoading,
            connect,
            disconnect
        }),
        [isActive, isLoading, account, connect, disconnect]
    )

    return (<MetaMaskContext.Provider value={values}>{children}</MetaMaskContext.Provider>)
}

export const useMetaMask = () => {
    const context = useContext(MetaMaskContext)

    if (context === undefined) {
        throw new Error('Something wrong with metamask provider')
    }

    return context
}
