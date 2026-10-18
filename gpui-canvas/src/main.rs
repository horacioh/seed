mod data;
mod view;

use gpui::{px, size, AppContext, Bounds, WindowBounds, WindowOptions};
use gpui_platform::application;
use view::CanvasView;

fn main() {
    // Space account to explore (default: vivienda-es public site).
    let root_uid = std::env::var("SEED_CANVAS_ROOT")
        .unwrap_or_else(|_| "z6Mkpqer25JrVxzoMobHUCkCv1r4fhiqTWwPWGrhcdGQVHHw".to_string());
    let daemon_addr =
        std::env::var("SEED_DAEMON_GRPC").unwrap_or_else(|_| "http://127.0.0.1:56002".to_string());

    application().run(move |cx| {
        let bounds = Bounds::centered(None, size(px(1280.), px(820.)), cx);
        let root_uid = root_uid.clone();
        let daemon_addr = daemon_addr.clone();
        cx.open_window(
            WindowOptions {
                window_bounds: Some(WindowBounds::Windowed(bounds)),
                ..Default::default()
            },
            move |_, cx| cx.new(|cx| CanvasView::new(root_uid, daemon_addr, cx)),
        )
        .unwrap();
        cx.on_window_closed(|cx, _| cx.quit()).detach();
        cx.activate(true);
    });
}
