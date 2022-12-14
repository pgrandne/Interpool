import { ethers } from 'ethers'
import { useState } from 'react'
import { useAccount, usePrepareContractWrite, useContractWrite, useContractReads, useWaitForTransaction } from 'wagmi'
import { erc20ABI } from 'wagmi'
import { ABI_Interpool } from '../../utils/ABI_Interpool'
import Faucet from '../../utils/Faucet'
import { useAddressNetwork } from '../../utils/useAddressNetwork'
import { toast } from 'react-toastify';

function Approve({ amount, amountApproved }: { amount: number, amountApproved: number }) {
    const addressNetwork: any = useAddressNetwork()
    const [approving, setApproving] = useState(false)
    const { config } = usePrepareContractWrite({
        address: addressNetwork.usdcContract,
        abi: erc20ABI,
        functionName: 'approve',
        args: [addressNetwork.poolContract, ethers.BigNumber.from(amount * 10 ** 6)],
    })
    const { write, data } = useContractWrite({
        ...config,
        onSuccess() {
            toast(`⚽ ${amount} USDC spending limit approval`)
        },
        onError() {
            toast("❌ Approval Canceled!")
            setApproving(false)
        }
    })

    useWaitForTransaction({
        hash: data?.hash,
        onSuccess() {
            toast(`⚽ ${amount} USDC spending limit Approved!`)
            setApproving(false)
        },
        onError() {
            toast("❌ Transaction failed!")
            setApproving(false)
        }
    })

    return (
        <a href="/" className={(amountApproved < amount) && !approving ? "hollow-button white" : "hollow-button notactive"}
            onClick={(e) => {
                e.preventDefault()
                setApproving(true)
                write?.()
            }}>{approving && <i className="fa fa-refresh fa-spin"></i>} Approve USDC</a>
    )
}

function Deposit({ amount, amountApproved, setModalDeposit, setDeposited }: {
    amount: number,
    amountApproved: number,
    setModalDeposit: React.Dispatch<React.SetStateAction<boolean>>,
    setDeposited: React.Dispatch<React.SetStateAction<boolean>>
}) {
    const addressNetwork: any = useAddressNetwork()
    const [loading, setLoading] = useState(false)

    const { data, write } = useContractWrite({
        mode: 'recklesslyUnprepared',
        address: addressNetwork.interPoolContract,
        abi: ABI_Interpool,
        functionName: 'deposit',
        args: [ethers.BigNumber.from(amount)],
        onSuccess() {
            toast(`⚽ ${amount} USDC deposit requested`)
        },
        onError() {
            toast("❌ Deposit Canceled!")
            setLoading(false)
        }
    })

    useWaitForTransaction({
        hash: data?.hash,
        onSuccess() {
            setLoading(false)
            setDeposited(true)
            setModalDeposit(false)
        },
        onError() {
            toast("❌ Transaction failed!")
            setLoading(false)
        }
    })

    return (
        <a href="/" className={(amountApproved >= amount) && !loading ? "hollow-button white" : "hollow-button notactive"}
            onClick={(e) => {
                e.preventDefault()
                setLoading(true)
                write?.()
            }}>{loading && <i className="fa fa-refresh fa-spin"></i>} Confirm Deposit</a>
    )
}

function ModalDeposit({ nbTickets, setModalDeposit, setDeposited }: { nbTickets: number, setModalDeposit: React.Dispatch<React.SetStateAction<boolean>>, setDeposited: React.Dispatch<React.SetStateAction<boolean>> }) {
    const addressNetwork: any = useAddressNetwork()
    const [balance, setBalance] = useState(50)
    const [amountApproved, setAmountApproved] = useState(0)
    const { address }: { address: any } = useAccount()
    useContractReads({
        contracts: [
            {
                address: addressNetwork.usdcContract,
                abi: erc20ABI,
                functionName: 'balanceOf',
                args: [address],
            },
            {
                address: addressNetwork.usdcContract,
                abi: erc20ABI,
                functionName: 'allowance',
                args: [address, addressNetwork.poolContract],
            },
        ],
        watch: true,
        onSuccess(data) {
            setBalance(parseFloat(ethers.utils.formatUnits(data[0]._hex, 6)))
            setAmountApproved(parseFloat(ethers.utils.formatUnits(data[1]._hex, 6)))
        }
    })

    return (
        <div className="modal-wrapper">
            <div data-w-id="17b55dba-8acd-ac79-4b99-88a555b29f51" className="modal-outside-trigger" onClick={(e) => { setModalDeposit(false) }}></div>
            <div className="modal-inner-wrapper">
                <div className="div-block-41"><img src="images/close.png" loading="lazy" width="20" height="20" data-w-id="17b55dba-8acd-ac79-4b99-88a555b29f54" alt="" className="image-18" onClick={(e) => { setModalDeposit(false) }} /></div>
                <h2 className="heading-7">Deposit Confirmation</h2>
                <p className="paragraph">Once you have your ticket(s) you become eligible to enter the prediction game. More tickets you own, higher are your rewards (more info <a href="https://irruption-lab.gitbook.io/interpool/welcome/frequently-asked-questions#prizes-and-winning" target="_blank" rel="noreferrer">here</a>)<br /></p>
                <div className="div-block-50">
                    <div className="text-block-45">Wallet balance:</div>
                    <div className="text-block-44">{balance} USDC</div>
                </div>
                <div className="div-block-39 div-block-39-variation">
                    <div className="div-block-36">
                        <div className="div-block-37"><img src="images/usd-coin-usdc-logo.png" loading="lazy" srcSet="images/usd-coin-usdc-logo-p-500.png 500w, images/usd-coin-usdc-logo-p-800.png 800w, images/usd-coin-usdc-logo-p-2000.png 2000w, images/usd-coin-usdc-logo.png 2000w" sizes="100vw" alt="" className="image-16" />
                            <div className="text-block-43">{nbTickets * 50}</div>
                        </div>
                        <div className="text-block-41">USDC*</div>
                    </div>
                    <div className="div-block-38"><img src="images/next.png" loading="lazy" alt="" className="image-17" /></div>
                    <div className="div-block-36">
                        <div className="div-block-37"><img src="images/ticket-2.png" loading="lazy" alt="" className="image-16" />
                            <div className="text-block-43">{nbTickets}</div>
                        </div>
                        <div className="text-block-41">x Ticket(s)</div>
                    </div>
                </div>
                {balance >= nbTickets * 50 && <Approve amount={nbTickets * 50} amountApproved={amountApproved} />}
                {balance >= nbTickets * 50 && <Deposit amount={nbTickets * 50} amountApproved={amountApproved} setModalDeposit={setModalDeposit} setDeposited={setDeposited} />}
                {balance < nbTickets * 50 && <Faucet />}
                <p className="paragraph-2">*Get your Deposit back anytime after the game completion or before predictions submission.</p>
            </div>
        </div>
    )
}

export default ModalDeposit;