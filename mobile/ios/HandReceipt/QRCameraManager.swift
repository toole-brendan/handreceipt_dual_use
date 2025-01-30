#if targetEnvironment(simulator)
extension QRCameraManager {
    func mockQRDetection() {
        let testPayload = """
        {
            "propertyId": "SIM-EMULATED-123",
            "signature": "emulated_signature_base64"
        }
        """
        self.delegate?.qrCodeDetected(testPayload)
    }
}
#endif 