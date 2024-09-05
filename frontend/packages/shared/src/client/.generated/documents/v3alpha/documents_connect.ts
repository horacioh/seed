// @generated by protoc-gen-connect-es v1.1.3 with parameter "target=ts,import_extension=none"
// @generated from file documents/v3alpha/documents.proto (package com.seed.documents.v3alpha, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import { CreateDocumentChangeRequest, DeleteDocumentRequest, Document, GetDocumentRequest, ListDocumentChangesRequest, ListDocumentChangesResponse, ListDocumentsRequest, ListDocumentsResponse, ListRootDocumentsRequest, ListRootDocumentsResponse } from "./documents_pb";
import { Empty, MethodKind } from "@bufbuild/protobuf";

/**
 * Documents service provides access to documents.
 *
 * @generated from service com.seed.documents.v3alpha.Documents
 */
export const Documents = {
  typeName: "com.seed.documents.v3alpha.Documents",
  methods: {
    /**
     * Retrieves an existing document.
     *
     * @generated from rpc com.seed.documents.v3alpha.Documents.GetDocument
     */
    getDocument: {
      name: "GetDocument",
      I: GetDocumentRequest,
      O: Document,
      kind: MethodKind.Unary,
    },
    /**
     * Creates a new Document Change.
     *
     * @generated from rpc com.seed.documents.v3alpha.Documents.CreateDocumentChange
     */
    createDocumentChange: {
      name: "CreateDocumentChange",
      I: CreateDocumentChangeRequest,
      O: Document,
      kind: MethodKind.Unary,
    },
    /**
     * Deletes a document.
     *
     * @generated from rpc com.seed.documents.v3alpha.Documents.DeleteDocument
     */
    deleteDocument: {
      name: "DeleteDocument",
      I: DeleteDocumentRequest,
      O: Empty,
      kind: MethodKind.Unary,
    },
    /**
     * Lists documents within the account. Only the most recent versions show up.
     *
     * @generated from rpc com.seed.documents.v3alpha.Documents.ListDocuments
     */
    listDocuments: {
      name: "ListDocuments",
      I: ListDocumentsRequest,
      O: ListDocumentsResponse,
      kind: MethodKind.Unary,
    },
    /**
     * Lists all the root documents that we know about.
     *
     * @generated from rpc com.seed.documents.v3alpha.Documents.ListRootDocuments
     */
    listRootDocuments: {
      name: "ListRootDocuments",
      I: ListRootDocumentsRequest,
      O: ListRootDocumentsResponse,
      kind: MethodKind.Unary,
    },
    /**
     * Lists all changes of a document.
     *
     * @generated from rpc com.seed.documents.v3alpha.Documents.ListDocumentChanges
     */
    listDocumentChanges: {
      name: "ListDocumentChanges",
      I: ListDocumentChangesRequest,
      O: ListDocumentChangesResponse,
      kind: MethodKind.Unary,
    },
  }
} as const;

