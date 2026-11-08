// Run the shared media-delivery invariants against the selected Coast payload.
process.env.VIDEO_DELIVERY_STAGE='dist-coast';
await import('../tests/video-delivery.test.mjs');
