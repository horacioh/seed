// @generated by protoc-gen-connect-es v1.1.3 with parameter "target=ts,import_extension=none"
// @generated from file daemon/v1alpha/daemon.proto (package com.seed.daemon.v1alpha, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import { DeleteAllKeysRequest, DeleteKeyRequest, ForceSyncRequest, GenMnemonicRequest, GenMnemonicResponse, GetInfoRequest, Info, ListKeysRequest, ListKeysResponse, NamedKey, RegisterKeyRequest, UpdateKeyRequest } from "./daemon_pb";
import { Empty, MethodKind } from "@bufbuild/protobuf";

/**
 * Daemon API allows to control and administer the Seed Daemon.
 *
 * @generated from service com.seed.daemon.v1alpha.Daemon
 */
export const Daemon = {
  typeName: "com.seed.daemon.v1alpha.Daemon",
  methods: {
    /**
     * Generates a set of BIP-39-compatible mnemonic words encoding a cryptographic seed.
     * This is a stateless call, and the generated mnemonic is not stored anywhere.
     * Subsequent call to RegisterKey can be used to register a new signing key derived from the mnemonic.
     *
     * @generated from rpc com.seed.daemon.v1alpha.Daemon.GenMnemonic
     */
    genMnemonic: {
      name: "GenMnemonic",
      I: GenMnemonicRequest,
      O: GenMnemonicResponse,
      kind: MethodKind.Unary,
    },
    /**
     * After generating the seed, this call is used to commit the seed and
     * create an account binding between the device and account.
     *
     * @generated from rpc com.seed.daemon.v1alpha.Daemon.RegisterKey
     */
    registerKey: {
      name: "RegisterKey",
      I: RegisterKeyRequest,
      O: NamedKey,
      kind: MethodKind.Unary,
    },
    /**
     * Get generic information about the running node.
     *
     * @generated from rpc com.seed.daemon.v1alpha.Daemon.GetInfo
     */
    getInfo: {
      name: "GetInfo",
      I: GetInfoRequest,
      O: Info,
      kind: MethodKind.Unary,
    },
    /**
     * Force-trigger periodic background sync of Seed objects.
     *
     * @generated from rpc com.seed.daemon.v1alpha.Daemon.ForceSync
     */
    forceSync: {
      name: "ForceSync",
      I: ForceSyncRequest,
      O: Empty,
      kind: MethodKind.Unary,
    },
    /**
     * Lists all the signing keys registered on this Daemon.
     *
     * @generated from rpc com.seed.daemon.v1alpha.Daemon.ListKeys
     */
    listKeys: {
      name: "ListKeys",
      I: ListKeysRequest,
      O: ListKeysResponse,
      kind: MethodKind.Unary,
    },
    /**
     * Updates the existing key.
     *
     * @generated from rpc com.seed.daemon.v1alpha.Daemon.UpdateKey
     */
    updateKey: {
      name: "UpdateKey",
      I: UpdateKeyRequest,
      O: NamedKey,
      kind: MethodKind.Unary,
    },
    /**
     * Deletes a key from the underlying key store.
     *
     * @generated from rpc com.seed.daemon.v1alpha.Daemon.DeleteKey
     */
    deleteKey: {
      name: "DeleteKey",
      I: DeleteKeyRequest,
      O: Empty,
      kind: MethodKind.Unary,
    },
    /**
     * Deletes all Seed keys from the underlying key store.
     *
     * @generated from rpc com.seed.daemon.v1alpha.Daemon.DeleteAllKeys
     */
    deleteAllKeys: {
      name: "DeleteAllKeys",
      I: DeleteAllKeysRequest,
      O: Empty,
      kind: MethodKind.Unary,
    },
  }
} as const;

