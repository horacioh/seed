// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.32.0
// 	protoc        v4.24.4
// source: documents/v3alpha/comments.proto

package documents

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	timestamppb "google.golang.org/protobuf/types/known/timestamppb"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

// Request to create a comment.
type CreateCommentRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	// Requred. Account ID to which the comment is applied.
	TargetAccount string `protobuf:"bytes,1,opt,name=target_account,json=targetAccount,proto3" json:"target_account,omitempty"`
	// Required. Path within the account where the comment is applied.
	TargetPath string `protobuf:"bytes,2,opt,name=target_path,json=targetPath,proto3" json:"target_path,omitempty"`
	// Required. Version of the document at the time of the comment.
	TargetVersion string `protobuf:"bytes,3,opt,name=target_version,json=targetVersion,proto3" json:"target_version,omitempty"`
	// Optional. When current comment is a reply to another comment,
	// this must be the ID of the comment being replied to.
	// Account and path of the parent comment must be the same as the current comment.
	ReplyParent string `protobuf:"bytes,4,opt,name=reply_parent,json=replyParent,proto3" json:"reply_parent,omitempty"`
	// Required. Content of the comment.
	Content []*BlockNode `protobuf:"bytes,5,rep,name=content,proto3" json:"content,omitempty"`
	// Required. Name of the key to use for signing the comment.
	SigningKeyName string `protobuf:"bytes,6,opt,name=signing_key_name,json=signingKeyName,proto3" json:"signing_key_name,omitempty"`
	// Optional. ID of the capability that allows publishing comments for the target account and path.
	// Anyone can create comments to anything, but having a capability to comment makes sure your comments are propagated along with the content.
	Capability string `protobuf:"bytes,7,opt,name=capability,proto3" json:"capability,omitempty"`
}

func (x *CreateCommentRequest) Reset() {
	*x = CreateCommentRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_documents_v3alpha_comments_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *CreateCommentRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*CreateCommentRequest) ProtoMessage() {}

func (x *CreateCommentRequest) ProtoReflect() protoreflect.Message {
	mi := &file_documents_v3alpha_comments_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use CreateCommentRequest.ProtoReflect.Descriptor instead.
func (*CreateCommentRequest) Descriptor() ([]byte, []int) {
	return file_documents_v3alpha_comments_proto_rawDescGZIP(), []int{0}
}

func (x *CreateCommentRequest) GetTargetAccount() string {
	if x != nil {
		return x.TargetAccount
	}
	return ""
}

func (x *CreateCommentRequest) GetTargetPath() string {
	if x != nil {
		return x.TargetPath
	}
	return ""
}

func (x *CreateCommentRequest) GetTargetVersion() string {
	if x != nil {
		return x.TargetVersion
	}
	return ""
}

func (x *CreateCommentRequest) GetReplyParent() string {
	if x != nil {
		return x.ReplyParent
	}
	return ""
}

func (x *CreateCommentRequest) GetContent() []*BlockNode {
	if x != nil {
		return x.Content
	}
	return nil
}

func (x *CreateCommentRequest) GetSigningKeyName() string {
	if x != nil {
		return x.SigningKeyName
	}
	return ""
}

func (x *CreateCommentRequest) GetCapability() string {
	if x != nil {
		return x.Capability
	}
	return ""
}

// Request to get a comment.
type GetCommentRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	// Required. ID of the comment to retrieve.
	Id string `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty"`
}

func (x *GetCommentRequest) Reset() {
	*x = GetCommentRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_documents_v3alpha_comments_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetCommentRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetCommentRequest) ProtoMessage() {}

func (x *GetCommentRequest) ProtoReflect() protoreflect.Message {
	mi := &file_documents_v3alpha_comments_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetCommentRequest.ProtoReflect.Descriptor instead.
func (*GetCommentRequest) Descriptor() ([]byte, []int) {
	return file_documents_v3alpha_comments_proto_rawDescGZIP(), []int{1}
}

func (x *GetCommentRequest) GetId() string {
	if x != nil {
		return x.Id
	}
	return ""
}

// Request to list comments.
type ListCommentsRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	// Required. Account ID to list the comments for.
	TargetAccount string `protobuf:"bytes,1,opt,name=target_account,json=targetAccount,proto3" json:"target_account,omitempty"`
	// Required. Path within the account to list the comments for.
	TargetPath string `protobuf:"bytes,2,opt,name=target_path,json=targetPath,proto3" json:"target_path,omitempty"`
	// Optional. The maximum number of comments to return.
	PageSize int32 `protobuf:"varint,3,opt,name=page_size,json=pageSize,proto3" json:"page_size,omitempty"`
	// Optional. The page token obtained from a previous request (if any).
	PageToken string `protobuf:"bytes,4,opt,name=page_token,json=pageToken,proto3" json:"page_token,omitempty"`
}

func (x *ListCommentsRequest) Reset() {
	*x = ListCommentsRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_documents_v3alpha_comments_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *ListCommentsRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ListCommentsRequest) ProtoMessage() {}

func (x *ListCommentsRequest) ProtoReflect() protoreflect.Message {
	mi := &file_documents_v3alpha_comments_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ListCommentsRequest.ProtoReflect.Descriptor instead.
func (*ListCommentsRequest) Descriptor() ([]byte, []int) {
	return file_documents_v3alpha_comments_proto_rawDescGZIP(), []int{2}
}

func (x *ListCommentsRequest) GetTargetAccount() string {
	if x != nil {
		return x.TargetAccount
	}
	return ""
}

func (x *ListCommentsRequest) GetTargetPath() string {
	if x != nil {
		return x.TargetPath
	}
	return ""
}

func (x *ListCommentsRequest) GetPageSize() int32 {
	if x != nil {
		return x.PageSize
	}
	return 0
}

func (x *ListCommentsRequest) GetPageToken() string {
	if x != nil {
		return x.PageToken
	}
	return ""
}

// Response with a list of comments.
type ListCommentsResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	// List of comments.
	Comments []*Comment `protobuf:"bytes,1,rep,name=comments,proto3" json:"comments,omitempty"`
	// Token to retrieve the next page of comments (if necessary).
	NextPageToken string `protobuf:"bytes,2,opt,name=next_page_token,json=nextPageToken,proto3" json:"next_page_token,omitempty"`
}

func (x *ListCommentsResponse) Reset() {
	*x = ListCommentsResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_documents_v3alpha_comments_proto_msgTypes[3]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *ListCommentsResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ListCommentsResponse) ProtoMessage() {}

func (x *ListCommentsResponse) ProtoReflect() protoreflect.Message {
	mi := &file_documents_v3alpha_comments_proto_msgTypes[3]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ListCommentsResponse.ProtoReflect.Descriptor instead.
func (*ListCommentsResponse) Descriptor() ([]byte, []int) {
	return file_documents_v3alpha_comments_proto_rawDescGZIP(), []int{3}
}

func (x *ListCommentsResponse) GetComments() []*Comment {
	if x != nil {
		return x.Comments
	}
	return nil
}

func (x *ListCommentsResponse) GetNextPageToken() string {
	if x != nil {
		return x.NextPageToken
	}
	return ""
}

// Comment is a unit of discussion.
type Comment struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	// ID of the current comment.
	Id string `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty"`
	// Account ID that this comment targets.
	TargetAccount string `protobuf:"bytes,2,opt,name=target_account,json=targetAccount,proto3" json:"target_account,omitempty"`
	// Path within the account this comment targets.
	TargetPath string `protobuf:"bytes,3,opt,name=target_path,json=targetPath,proto3" json:"target_path,omitempty"`
	// Version of the document this comment targets.
	TargetVersion string `protobuf:"bytes,4,opt,name=target_version,json=targetVersion,proto3" json:"target_version,omitempty"`
	// Optional. The ID of the top-level non-reply comment of the conversation thread.
	ThreadRoot string `protobuf:"bytes,5,opt,name=thread_root,json=threadRoot,proto3" json:"thread_root,omitempty"`
	// Optional. The ID of the comment to which this comment is a direct reply.
	// For initial comments this field is empty.
	ReplyParent string `protobuf:"bytes,6,opt,name=reply_parent,json=replyParent,proto3" json:"reply_parent,omitempty"`
	// Account ID of the author of the comment.
	Author string `protobuf:"bytes,7,opt,name=author,proto3" json:"author,omitempty"`
	// Content of the comment.
	Content []*BlockNode `protobuf:"bytes,8,rep,name=content,proto3" json:"content,omitempty"`
	// Timestamp when the comment was created.
	CreateTime *timestamppb.Timestamp `protobuf:"bytes,9,opt,name=create_time,json=createTime,proto3" json:"create_time,omitempty"`
	// Optional. ID of the capability this comment was created with, if any.
	Capability string `protobuf:"bytes,10,opt,name=capability,proto3" json:"capability,omitempty"`
}

func (x *Comment) Reset() {
	*x = Comment{}
	if protoimpl.UnsafeEnabled {
		mi := &file_documents_v3alpha_comments_proto_msgTypes[4]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Comment) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Comment) ProtoMessage() {}

func (x *Comment) ProtoReflect() protoreflect.Message {
	mi := &file_documents_v3alpha_comments_proto_msgTypes[4]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Comment.ProtoReflect.Descriptor instead.
func (*Comment) Descriptor() ([]byte, []int) {
	return file_documents_v3alpha_comments_proto_rawDescGZIP(), []int{4}
}

func (x *Comment) GetId() string {
	if x != nil {
		return x.Id
	}
	return ""
}

func (x *Comment) GetTargetAccount() string {
	if x != nil {
		return x.TargetAccount
	}
	return ""
}

func (x *Comment) GetTargetPath() string {
	if x != nil {
		return x.TargetPath
	}
	return ""
}

func (x *Comment) GetTargetVersion() string {
	if x != nil {
		return x.TargetVersion
	}
	return ""
}

func (x *Comment) GetThreadRoot() string {
	if x != nil {
		return x.ThreadRoot
	}
	return ""
}

func (x *Comment) GetReplyParent() string {
	if x != nil {
		return x.ReplyParent
	}
	return ""
}

func (x *Comment) GetAuthor() string {
	if x != nil {
		return x.Author
	}
	return ""
}

func (x *Comment) GetContent() []*BlockNode {
	if x != nil {
		return x.Content
	}
	return nil
}

func (x *Comment) GetCreateTime() *timestamppb.Timestamp {
	if x != nil {
		return x.CreateTime
	}
	return nil
}

func (x *Comment) GetCapability() string {
	if x != nil {
		return x.Capability
	}
	return ""
}

var File_documents_v3alpha_comments_proto protoreflect.FileDescriptor

var file_documents_v3alpha_comments_proto_rawDesc = []byte{
	0x0a, 0x20, 0x64, 0x6f, 0x63, 0x75, 0x6d, 0x65, 0x6e, 0x74, 0x73, 0x2f, 0x76, 0x33, 0x61, 0x6c,
	0x70, 0x68, 0x61, 0x2f, 0x63, 0x6f, 0x6d, 0x6d, 0x65, 0x6e, 0x74, 0x73, 0x2e, 0x70, 0x72, 0x6f,
	0x74, 0x6f, 0x12, 0x1a, 0x63, 0x6f, 0x6d, 0x2e, 0x73, 0x65, 0x65, 0x64, 0x2e, 0x64, 0x6f, 0x63,
	0x75, 0x6d, 0x65, 0x6e, 0x74, 0x73, 0x2e, 0x76, 0x33, 0x61, 0x6c, 0x70, 0x68, 0x61, 0x1a, 0x21,
	0x64, 0x6f, 0x63, 0x75, 0x6d, 0x65, 0x6e, 0x74, 0x73, 0x2f, 0x76, 0x33, 0x61, 0x6c, 0x70, 0x68,
	0x61, 0x2f, 0x64, 0x6f, 0x63, 0x75, 0x6d, 0x65, 0x6e, 0x74, 0x73, 0x2e, 0x70, 0x72, 0x6f, 0x74,
	0x6f, 0x1a, 0x1f, 0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65, 0x2f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x62,
	0x75, 0x66, 0x2f, 0x74, 0x69, 0x6d, 0x65, 0x73, 0x74, 0x61, 0x6d, 0x70, 0x2e, 0x70, 0x72, 0x6f,
	0x74, 0x6f, 0x22, 0xb3, 0x02, 0x0a, 0x14, 0x43, 0x72, 0x65, 0x61, 0x74, 0x65, 0x43, 0x6f, 0x6d,
	0x6d, 0x65, 0x6e, 0x74, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x25, 0x0a, 0x0e, 0x74,
	0x61, 0x72, 0x67, 0x65, 0x74, 0x5f, 0x61, 0x63, 0x63, 0x6f, 0x75, 0x6e, 0x74, 0x18, 0x01, 0x20,
	0x01, 0x28, 0x09, 0x52, 0x0d, 0x74, 0x61, 0x72, 0x67, 0x65, 0x74, 0x41, 0x63, 0x63, 0x6f, 0x75,
	0x6e, 0x74, 0x12, 0x1f, 0x0a, 0x0b, 0x74, 0x61, 0x72, 0x67, 0x65, 0x74, 0x5f, 0x70, 0x61, 0x74,
	0x68, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x0a, 0x74, 0x61, 0x72, 0x67, 0x65, 0x74, 0x50,
	0x61, 0x74, 0x68, 0x12, 0x25, 0x0a, 0x0e, 0x74, 0x61, 0x72, 0x67, 0x65, 0x74, 0x5f, 0x76, 0x65,
	0x72, 0x73, 0x69, 0x6f, 0x6e, 0x18, 0x03, 0x20, 0x01, 0x28, 0x09, 0x52, 0x0d, 0x74, 0x61, 0x72,
	0x67, 0x65, 0x74, 0x56, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e, 0x12, 0x21, 0x0a, 0x0c, 0x72, 0x65,
	0x70, 0x6c, 0x79, 0x5f, 0x70, 0x61, 0x72, 0x65, 0x6e, 0x74, 0x18, 0x04, 0x20, 0x01, 0x28, 0x09,
	0x52, 0x0b, 0x72, 0x65, 0x70, 0x6c, 0x79, 0x50, 0x61, 0x72, 0x65, 0x6e, 0x74, 0x12, 0x3f, 0x0a,
	0x07, 0x63, 0x6f, 0x6e, 0x74, 0x65, 0x6e, 0x74, 0x18, 0x05, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x25,
	0x2e, 0x63, 0x6f, 0x6d, 0x2e, 0x73, 0x65, 0x65, 0x64, 0x2e, 0x64, 0x6f, 0x63, 0x75, 0x6d, 0x65,
	0x6e, 0x74, 0x73, 0x2e, 0x76, 0x33, 0x61, 0x6c, 0x70, 0x68, 0x61, 0x2e, 0x42, 0x6c, 0x6f, 0x63,
	0x6b, 0x4e, 0x6f, 0x64, 0x65, 0x52, 0x07, 0x63, 0x6f, 0x6e, 0x74, 0x65, 0x6e, 0x74, 0x12, 0x28,
	0x0a, 0x10, 0x73, 0x69, 0x67, 0x6e, 0x69, 0x6e, 0x67, 0x5f, 0x6b, 0x65, 0x79, 0x5f, 0x6e, 0x61,
	0x6d, 0x65, 0x18, 0x06, 0x20, 0x01, 0x28, 0x09, 0x52, 0x0e, 0x73, 0x69, 0x67, 0x6e, 0x69, 0x6e,
	0x67, 0x4b, 0x65, 0x79, 0x4e, 0x61, 0x6d, 0x65, 0x12, 0x1e, 0x0a, 0x0a, 0x63, 0x61, 0x70, 0x61,
	0x62, 0x69, 0x6c, 0x69, 0x74, 0x79, 0x18, 0x07, 0x20, 0x01, 0x28, 0x09, 0x52, 0x0a, 0x63, 0x61,
	0x70, 0x61, 0x62, 0x69, 0x6c, 0x69, 0x74, 0x79, 0x22, 0x23, 0x0a, 0x11, 0x47, 0x65, 0x74, 0x43,
	0x6f, 0x6d, 0x6d, 0x65, 0x6e, 0x74, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x0e, 0x0a,
	0x02, 0x69, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x02, 0x69, 0x64, 0x22, 0x99, 0x01,
	0x0a, 0x13, 0x4c, 0x69, 0x73, 0x74, 0x43, 0x6f, 0x6d, 0x6d, 0x65, 0x6e, 0x74, 0x73, 0x52, 0x65,
	0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x25, 0x0a, 0x0e, 0x74, 0x61, 0x72, 0x67, 0x65, 0x74, 0x5f,
	0x61, 0x63, 0x63, 0x6f, 0x75, 0x6e, 0x74, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x0d, 0x74,
	0x61, 0x72, 0x67, 0x65, 0x74, 0x41, 0x63, 0x63, 0x6f, 0x75, 0x6e, 0x74, 0x12, 0x1f, 0x0a, 0x0b,
	0x74, 0x61, 0x72, 0x67, 0x65, 0x74, 0x5f, 0x70, 0x61, 0x74, 0x68, 0x18, 0x02, 0x20, 0x01, 0x28,
	0x09, 0x52, 0x0a, 0x74, 0x61, 0x72, 0x67, 0x65, 0x74, 0x50, 0x61, 0x74, 0x68, 0x12, 0x1b, 0x0a,
	0x09, 0x70, 0x61, 0x67, 0x65, 0x5f, 0x73, 0x69, 0x7a, 0x65, 0x18, 0x03, 0x20, 0x01, 0x28, 0x05,
	0x52, 0x08, 0x70, 0x61, 0x67, 0x65, 0x53, 0x69, 0x7a, 0x65, 0x12, 0x1d, 0x0a, 0x0a, 0x70, 0x61,
	0x67, 0x65, 0x5f, 0x74, 0x6f, 0x6b, 0x65, 0x6e, 0x18, 0x04, 0x20, 0x01, 0x28, 0x09, 0x52, 0x09,
	0x70, 0x61, 0x67, 0x65, 0x54, 0x6f, 0x6b, 0x65, 0x6e, 0x22, 0x7f, 0x0a, 0x14, 0x4c, 0x69, 0x73,
	0x74, 0x43, 0x6f, 0x6d, 0x6d, 0x65, 0x6e, 0x74, 0x73, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73,
	0x65, 0x12, 0x3f, 0x0a, 0x08, 0x63, 0x6f, 0x6d, 0x6d, 0x65, 0x6e, 0x74, 0x73, 0x18, 0x01, 0x20,
	0x03, 0x28, 0x0b, 0x32, 0x23, 0x2e, 0x63, 0x6f, 0x6d, 0x2e, 0x73, 0x65, 0x65, 0x64, 0x2e, 0x64,
	0x6f, 0x63, 0x75, 0x6d, 0x65, 0x6e, 0x74, 0x73, 0x2e, 0x76, 0x33, 0x61, 0x6c, 0x70, 0x68, 0x61,
	0x2e, 0x43, 0x6f, 0x6d, 0x6d, 0x65, 0x6e, 0x74, 0x52, 0x08, 0x63, 0x6f, 0x6d, 0x6d, 0x65, 0x6e,
	0x74, 0x73, 0x12, 0x26, 0x0a, 0x0f, 0x6e, 0x65, 0x78, 0x74, 0x5f, 0x70, 0x61, 0x67, 0x65, 0x5f,
	0x74, 0x6f, 0x6b, 0x65, 0x6e, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x0d, 0x6e, 0x65, 0x78,
	0x74, 0x50, 0x61, 0x67, 0x65, 0x54, 0x6f, 0x6b, 0x65, 0x6e, 0x22, 0x82, 0x03, 0x0a, 0x07, 0x43,
	0x6f, 0x6d, 0x6d, 0x65, 0x6e, 0x74, 0x12, 0x0e, 0x0a, 0x02, 0x69, 0x64, 0x18, 0x01, 0x20, 0x01,
	0x28, 0x09, 0x52, 0x02, 0x69, 0x64, 0x12, 0x25, 0x0a, 0x0e, 0x74, 0x61, 0x72, 0x67, 0x65, 0x74,
	0x5f, 0x61, 0x63, 0x63, 0x6f, 0x75, 0x6e, 0x74, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x0d,
	0x74, 0x61, 0x72, 0x67, 0x65, 0x74, 0x41, 0x63, 0x63, 0x6f, 0x75, 0x6e, 0x74, 0x12, 0x1f, 0x0a,
	0x0b, 0x74, 0x61, 0x72, 0x67, 0x65, 0x74, 0x5f, 0x70, 0x61, 0x74, 0x68, 0x18, 0x03, 0x20, 0x01,
	0x28, 0x09, 0x52, 0x0a, 0x74, 0x61, 0x72, 0x67, 0x65, 0x74, 0x50, 0x61, 0x74, 0x68, 0x12, 0x25,
	0x0a, 0x0e, 0x74, 0x61, 0x72, 0x67, 0x65, 0x74, 0x5f, 0x76, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e,
	0x18, 0x04, 0x20, 0x01, 0x28, 0x09, 0x52, 0x0d, 0x74, 0x61, 0x72, 0x67, 0x65, 0x74, 0x56, 0x65,
	0x72, 0x73, 0x69, 0x6f, 0x6e, 0x12, 0x1f, 0x0a, 0x0b, 0x74, 0x68, 0x72, 0x65, 0x61, 0x64, 0x5f,
	0x72, 0x6f, 0x6f, 0x74, 0x18, 0x05, 0x20, 0x01, 0x28, 0x09, 0x52, 0x0a, 0x74, 0x68, 0x72, 0x65,
	0x61, 0x64, 0x52, 0x6f, 0x6f, 0x74, 0x12, 0x21, 0x0a, 0x0c, 0x72, 0x65, 0x70, 0x6c, 0x79, 0x5f,
	0x70, 0x61, 0x72, 0x65, 0x6e, 0x74, 0x18, 0x06, 0x20, 0x01, 0x28, 0x09, 0x52, 0x0b, 0x72, 0x65,
	0x70, 0x6c, 0x79, 0x50, 0x61, 0x72, 0x65, 0x6e, 0x74, 0x12, 0x16, 0x0a, 0x06, 0x61, 0x75, 0x74,
	0x68, 0x6f, 0x72, 0x18, 0x07, 0x20, 0x01, 0x28, 0x09, 0x52, 0x06, 0x61, 0x75, 0x74, 0x68, 0x6f,
	0x72, 0x12, 0x3f, 0x0a, 0x07, 0x63, 0x6f, 0x6e, 0x74, 0x65, 0x6e, 0x74, 0x18, 0x08, 0x20, 0x03,
	0x28, 0x0b, 0x32, 0x25, 0x2e, 0x63, 0x6f, 0x6d, 0x2e, 0x73, 0x65, 0x65, 0x64, 0x2e, 0x64, 0x6f,
	0x63, 0x75, 0x6d, 0x65, 0x6e, 0x74, 0x73, 0x2e, 0x76, 0x33, 0x61, 0x6c, 0x70, 0x68, 0x61, 0x2e,
	0x42, 0x6c, 0x6f, 0x63, 0x6b, 0x4e, 0x6f, 0x64, 0x65, 0x52, 0x07, 0x63, 0x6f, 0x6e, 0x74, 0x65,
	0x6e, 0x74, 0x12, 0x3b, 0x0a, 0x0b, 0x63, 0x72, 0x65, 0x61, 0x74, 0x65, 0x5f, 0x74, 0x69, 0x6d,
	0x65, 0x18, 0x09, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x1a, 0x2e, 0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65,
	0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x62, 0x75, 0x66, 0x2e, 0x54, 0x69, 0x6d, 0x65, 0x73, 0x74,
	0x61, 0x6d, 0x70, 0x52, 0x0a, 0x63, 0x72, 0x65, 0x61, 0x74, 0x65, 0x54, 0x69, 0x6d, 0x65, 0x12,
	0x1e, 0x0a, 0x0a, 0x63, 0x61, 0x70, 0x61, 0x62, 0x69, 0x6c, 0x69, 0x74, 0x79, 0x18, 0x0a, 0x20,
	0x01, 0x28, 0x09, 0x52, 0x0a, 0x63, 0x61, 0x70, 0x61, 0x62, 0x69, 0x6c, 0x69, 0x74, 0x79, 0x32,
	0xc7, 0x02, 0x0a, 0x08, 0x43, 0x6f, 0x6d, 0x6d, 0x65, 0x6e, 0x74, 0x73, 0x12, 0x66, 0x0a, 0x0d,
	0x43, 0x72, 0x65, 0x61, 0x74, 0x65, 0x43, 0x6f, 0x6d, 0x6d, 0x65, 0x6e, 0x74, 0x12, 0x30, 0x2e,
	0x63, 0x6f, 0x6d, 0x2e, 0x73, 0x65, 0x65, 0x64, 0x2e, 0x64, 0x6f, 0x63, 0x75, 0x6d, 0x65, 0x6e,
	0x74, 0x73, 0x2e, 0x76, 0x33, 0x61, 0x6c, 0x70, 0x68, 0x61, 0x2e, 0x43, 0x72, 0x65, 0x61, 0x74,
	0x65, 0x43, 0x6f, 0x6d, 0x6d, 0x65, 0x6e, 0x74, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x1a,
	0x23, 0x2e, 0x63, 0x6f, 0x6d, 0x2e, 0x73, 0x65, 0x65, 0x64, 0x2e, 0x64, 0x6f, 0x63, 0x75, 0x6d,
	0x65, 0x6e, 0x74, 0x73, 0x2e, 0x76, 0x33, 0x61, 0x6c, 0x70, 0x68, 0x61, 0x2e, 0x43, 0x6f, 0x6d,
	0x6d, 0x65, 0x6e, 0x74, 0x12, 0x60, 0x0a, 0x0a, 0x47, 0x65, 0x74, 0x43, 0x6f, 0x6d, 0x6d, 0x65,
	0x6e, 0x74, 0x12, 0x2d, 0x2e, 0x63, 0x6f, 0x6d, 0x2e, 0x73, 0x65, 0x65, 0x64, 0x2e, 0x64, 0x6f,
	0x63, 0x75, 0x6d, 0x65, 0x6e, 0x74, 0x73, 0x2e, 0x76, 0x33, 0x61, 0x6c, 0x70, 0x68, 0x61, 0x2e,
	0x47, 0x65, 0x74, 0x43, 0x6f, 0x6d, 0x6d, 0x65, 0x6e, 0x74, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73,
	0x74, 0x1a, 0x23, 0x2e, 0x63, 0x6f, 0x6d, 0x2e, 0x73, 0x65, 0x65, 0x64, 0x2e, 0x64, 0x6f, 0x63,
	0x75, 0x6d, 0x65, 0x6e, 0x74, 0x73, 0x2e, 0x76, 0x33, 0x61, 0x6c, 0x70, 0x68, 0x61, 0x2e, 0x43,
	0x6f, 0x6d, 0x6d, 0x65, 0x6e, 0x74, 0x12, 0x71, 0x0a, 0x0c, 0x4c, 0x69, 0x73, 0x74, 0x43, 0x6f,
	0x6d, 0x6d, 0x65, 0x6e, 0x74, 0x73, 0x12, 0x2f, 0x2e, 0x63, 0x6f, 0x6d, 0x2e, 0x73, 0x65, 0x65,
	0x64, 0x2e, 0x64, 0x6f, 0x63, 0x75, 0x6d, 0x65, 0x6e, 0x74, 0x73, 0x2e, 0x76, 0x33, 0x61, 0x6c,
	0x70, 0x68, 0x61, 0x2e, 0x4c, 0x69, 0x73, 0x74, 0x43, 0x6f, 0x6d, 0x6d, 0x65, 0x6e, 0x74, 0x73,
	0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x1a, 0x30, 0x2e, 0x63, 0x6f, 0x6d, 0x2e, 0x73, 0x65,
	0x65, 0x64, 0x2e, 0x64, 0x6f, 0x63, 0x75, 0x6d, 0x65, 0x6e, 0x74, 0x73, 0x2e, 0x76, 0x33, 0x61,
	0x6c, 0x70, 0x68, 0x61, 0x2e, 0x4c, 0x69, 0x73, 0x74, 0x43, 0x6f, 0x6d, 0x6d, 0x65, 0x6e, 0x74,
	0x73, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x42, 0x33, 0x5a, 0x31, 0x73, 0x65, 0x65,
	0x64, 0x2f, 0x62, 0x61, 0x63, 0x6b, 0x65, 0x6e, 0x64, 0x2f, 0x67, 0x65, 0x6e, 0x70, 0x72, 0x6f,
	0x74, 0x6f, 0x2f, 0x64, 0x6f, 0x63, 0x75, 0x6d, 0x65, 0x6e, 0x74, 0x73, 0x2f, 0x76, 0x33, 0x61,
	0x6c, 0x70, 0x68, 0x61, 0x3b, 0x64, 0x6f, 0x63, 0x75, 0x6d, 0x65, 0x6e, 0x74, 0x73, 0x62, 0x06,
	0x70, 0x72, 0x6f, 0x74, 0x6f, 0x33,
}

var (
	file_documents_v3alpha_comments_proto_rawDescOnce sync.Once
	file_documents_v3alpha_comments_proto_rawDescData = file_documents_v3alpha_comments_proto_rawDesc
)

func file_documents_v3alpha_comments_proto_rawDescGZIP() []byte {
	file_documents_v3alpha_comments_proto_rawDescOnce.Do(func() {
		file_documents_v3alpha_comments_proto_rawDescData = protoimpl.X.CompressGZIP(file_documents_v3alpha_comments_proto_rawDescData)
	})
	return file_documents_v3alpha_comments_proto_rawDescData
}

var file_documents_v3alpha_comments_proto_msgTypes = make([]protoimpl.MessageInfo, 5)
var file_documents_v3alpha_comments_proto_goTypes = []interface{}{
	(*CreateCommentRequest)(nil),  // 0: com.seed.documents.v3alpha.CreateCommentRequest
	(*GetCommentRequest)(nil),     // 1: com.seed.documents.v3alpha.GetCommentRequest
	(*ListCommentsRequest)(nil),   // 2: com.seed.documents.v3alpha.ListCommentsRequest
	(*ListCommentsResponse)(nil),  // 3: com.seed.documents.v3alpha.ListCommentsResponse
	(*Comment)(nil),               // 4: com.seed.documents.v3alpha.Comment
	(*BlockNode)(nil),             // 5: com.seed.documents.v3alpha.BlockNode
	(*timestamppb.Timestamp)(nil), // 6: google.protobuf.Timestamp
}
var file_documents_v3alpha_comments_proto_depIdxs = []int32{
	5, // 0: com.seed.documents.v3alpha.CreateCommentRequest.content:type_name -> com.seed.documents.v3alpha.BlockNode
	4, // 1: com.seed.documents.v3alpha.ListCommentsResponse.comments:type_name -> com.seed.documents.v3alpha.Comment
	5, // 2: com.seed.documents.v3alpha.Comment.content:type_name -> com.seed.documents.v3alpha.BlockNode
	6, // 3: com.seed.documents.v3alpha.Comment.create_time:type_name -> google.protobuf.Timestamp
	0, // 4: com.seed.documents.v3alpha.Comments.CreateComment:input_type -> com.seed.documents.v3alpha.CreateCommentRequest
	1, // 5: com.seed.documents.v3alpha.Comments.GetComment:input_type -> com.seed.documents.v3alpha.GetCommentRequest
	2, // 6: com.seed.documents.v3alpha.Comments.ListComments:input_type -> com.seed.documents.v3alpha.ListCommentsRequest
	4, // 7: com.seed.documents.v3alpha.Comments.CreateComment:output_type -> com.seed.documents.v3alpha.Comment
	4, // 8: com.seed.documents.v3alpha.Comments.GetComment:output_type -> com.seed.documents.v3alpha.Comment
	3, // 9: com.seed.documents.v3alpha.Comments.ListComments:output_type -> com.seed.documents.v3alpha.ListCommentsResponse
	7, // [7:10] is the sub-list for method output_type
	4, // [4:7] is the sub-list for method input_type
	4, // [4:4] is the sub-list for extension type_name
	4, // [4:4] is the sub-list for extension extendee
	0, // [0:4] is the sub-list for field type_name
}

func init() { file_documents_v3alpha_comments_proto_init() }
func file_documents_v3alpha_comments_proto_init() {
	if File_documents_v3alpha_comments_proto != nil {
		return
	}
	file_documents_v3alpha_documents_proto_init()
	if !protoimpl.UnsafeEnabled {
		file_documents_v3alpha_comments_proto_msgTypes[0].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*CreateCommentRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_documents_v3alpha_comments_proto_msgTypes[1].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetCommentRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_documents_v3alpha_comments_proto_msgTypes[2].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*ListCommentsRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_documents_v3alpha_comments_proto_msgTypes[3].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*ListCommentsResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_documents_v3alpha_comments_proto_msgTypes[4].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Comment); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_documents_v3alpha_comments_proto_rawDesc,
			NumEnums:      0,
			NumMessages:   5,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_documents_v3alpha_comments_proto_goTypes,
		DependencyIndexes: file_documents_v3alpha_comments_proto_depIdxs,
		MessageInfos:      file_documents_v3alpha_comments_proto_msgTypes,
	}.Build()
	File_documents_v3alpha_comments_proto = out.File
	file_documents_v3alpha_comments_proto_rawDesc = nil
	file_documents_v3alpha_comments_proto_goTypes = nil
	file_documents_v3alpha_comments_proto_depIdxs = nil
}
