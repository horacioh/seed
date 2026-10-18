fn main() {
    std::env::set_var("PROTOC", protoc_bin_vendored::protoc_bin_path().unwrap());
    tonic_prost_build::configure()
        .build_server(false)
        .compile_protos(
            &[
                "../proto/documents/v3alpha/documents.proto",
                "../proto/documents/v3alpha/comments.proto",
                "../proto/documents/v3alpha/resources.proto",
            ],
            &["../proto"],
        )
        .unwrap();
}
