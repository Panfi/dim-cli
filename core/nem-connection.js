/**
 * Part of the dimcoin/dim-cli package.
 *
 * NOTICE OF LICENSE
 *
 * Licensed under MIT License.
 *
 * This source file is subject to the MIT License that is
 * bundled with this package in the LICENSE file.
 *
 * @package    dimcoin/dim-cli
 * @author     DIMCoin Developers
 * @license    MIT License
 * @copyright  (c) 2018, DIMCoin Developers
 * @link       https://github.com/dimcoin/dim-cli
 */
"use strict";

import ConsoleInput from "./console-input";
import NEM from "nem-sdk";

/**
 * The `NEMNetworkConnection` class is responsible for the
 * configuration of the NEM network connection.
 * 
 * Instances of this class will hold a `networkId`, a `host`
 * and a `port` property in addition to a `SDK` property
 * which can be used to interact with the NEM-SDK.
 */
class NEMNetworkConnection {

    /**
     * Construct a NEM network connection object.
     * 
     * This object will hold created utilities objects from the NEM-sdk
     * 
     * @param   {string|integer}    network
     * @param   {string}            host
     * @param   {integer}           port
     */
    constructor(network, host, port, wsScheme) {
        this.defaultNodes = {
            "mainnet": "hugealice.nem.ninja",
            "testnet": "bigalice2.nem.ninja"
        };

        this.SDK = NEM;

        this.networkId = 104;
        this.host = "hugealice.nem.ninja";
        this.port = 7890;
        this.wsScheme = (wsScheme || "ws");
        this.wsPort = this.wsScheme.match(/^wss/) ? 7779 : 7778;

        this.setNetwork(network);
        this.setHost(host);
        this.setPort(port);

        this.node = NEM.model.objects.create("endpoint")(this.getHost(), this.port);
        this.wsNode = NEM.model.objects.create("endpoint")(this.getHost(), this.wsPort);

        /**
         * The Websocket stream.
         * 
         * @var {Array}
         */
        this.stream = [];
    }

    /**
     * Set properties of the objects using setter methods.
     * 
     * The `opts` object can contain 'network', 'node' and
     * 'port' values.
     * 
     * @param   {object}    opts    The NEM Connection object properties
     */
    setOptions(opts) {
        for (let key in Object.getOwnPropertyNames(opts)) {
            let val = opts[key];

            if ("network" === key) {
                this.setNetwork(val);
            }
            else if ("host" === key) {
                this.setHost(val);
            }
            else if ("port" === key) {
                this.setPort(val);
            }
        }

        return this;
    }

    /**
     * This method will configure the `networkId` property of this
     * NEM Network Connection instance.
     * 
     * The Network ID is used for various SDK and NIS APIs requests.
     * 
     * @param   {string}    network
     */
    setNetwork(network) {
        let netIds = {
            "mainnet": NEM.model.network.data.mainnet.id,
            "testnet": NEM.model.network.data.testnet.id,
            "mijin": NEM.model.network.data.mijin.id,
        };

        // identify parameter
        if (typeof network === 'string') {
            network = network.toLowerCase();
            if (netIds.hasOwnProperty(network)) {
                this.networkId = netIds[network];
                return this;
            }
        }
        else if (typeof network === "number" && parseInt(network)) {
            this.networkId = parseInt(network) ? parseInt(network) : netIds["testnet"];
            return this;
        }

        // could not identify network
        this.networkId = netIds["testnet"];
        return this;
    }

    /**
     * Set the NIS node host to be used for the NEM
     * Network Connection.
     * 
     * @param   {string}    host
     */
    setHost(host) {
        if (!host || !host.length)
            host = this.defaultNodes["testnet"];

        let nsch = host.match(/^http/) ? host.replace(/:\/\/.*/, '') : null;
        let node = host.replace(/https?:\/\//, '');
        let scheme = nsch ? nsch : "http";

        this.host = scheme + "://" + node;
        return this;
    }

    /**
     * Set the port for the NEM Network Connection
     * to the configured node.
     * 
     * @param   {integer}   post
     */
    setPort(port) {
        this.port = parseInt(port);
        return this;
    }

    /**
     * Getter for the `networkId` property.
     *
     * The network ID is returned because that's the 
     * important information to keep about "mainnet", etc.
     *
     * @return integer
     */
    getNetwork() { 
        return this.networkId 
    }

    /**
     * Getter for the `host` property.
     *
     * You can set the `scheme` parameter to `false`
     * if you wish to exclude the protocol Scheme and
     * return only the *hostname*.
     *
     * @param   boolean scheme  Whether to include the scheme or not (http://) (Default: Yes)
     * @return  string
     */
    getHost(scheme) { 
        if (scheme === false) 
            return this.host.replace(/https?:\/\//, '');
        else if (scheme && ! /^https?/.test(scheme)) {
            // different scheme requested (ws/wss/ftp)
            return this.host.replace(/https?:\/\//, (scheme.replace(/:\/\/$/, '') + '://'));
        }

        return this.host;
    }

    /**
     * Getter for the `port` property.
     *
     * @return  integer
     */
    getPort() { 
        return this.port;
    }

    /**
     * Return the network name for a given `address`.
     *
     * This method will return one of *mainnet*, *testnet*
     * and *mijin*.
     *
     * The first character of the address is determining on
     * the NEM network to define the network being used.
     *
     * @param {string} address 
     */
    static getNetworkForAddress(address)
    {
        let char = address.substr(0, 1);
        let nets = {
            "N": "mainnet",
            "T": "testnet"
        };

        if (nets.hasOwnProperty(char))
            return nets[char];

        // for non-recognized starting letter, use Mijin network
        return "mijin";
    }
}

exports.NEMNetworkConnection = NEMNetworkConnection;
export default NEMNetworkConnection;
