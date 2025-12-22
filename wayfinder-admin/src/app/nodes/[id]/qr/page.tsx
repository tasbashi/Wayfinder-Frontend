"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { useNodeStore } from "@/store/nodeStore";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Download, Printer } from "lucide-react";
import Link from "next/link";

function QRCodeContent() {
  const params = useParams();
  const router = useRouter();
  const nodeId = params.id as string;
  const {
    currentNode,
    isLoading,
    error,
    fetchNodeById,
  } = useNodeStore();
  const [qrCodeValue, setQrCodeValue] = useState<string>("");

  useEffect(() => {
    if (nodeId) {
      fetchNodeById(nodeId);
    }
  }, [nodeId, fetchNodeById]);

  useEffect(() => {
    if (currentNode) {
      setQrCodeValue(currentNode.qrCode || `WF-${nodeId}`);
    }
  }, [currentNode]);

  const handleDownload = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-code-${nodeId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading && !currentNode) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" text="Loading QR code..." />
        </div>
      </Layout>
    );
  }

  if (error && !currentNode) {
    return (
      <Layout>
        <div className="p-6">
          <ErrorMessage message={error} />
          <Button
            onClick={() => router.push("/nodes")}
            className="mt-4"
            variant="outline"
          >
            Back to Nodes
          </Button>
        </div>
      </Layout>
    );
  }

  if (!currentNode) {
    return null;
  }

  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto">
        <Link
          href={`/nodes/${nodeId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Node
        </Link>

        <Card>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            QR Code for {currentNode.name}
          </h1>

          <div className="flex flex-col items-center space-y-6">
            <div className="p-6 bg-white border-2 border-gray-200 rounded-lg">
              <QRCodeSVG
                id="qr-code-svg"
                value={qrCodeValue}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">QR Code Value</p>
              <p className="font-mono text-lg text-gray-900 break-all">
                {qrCodeValue}
              </p>
            </div>

            <div className="flex gap-4 w-full">
              <Button
                variant="outline"
                onClick={handleDownload}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                className="flex-1"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>

            <div className="text-sm text-gray-500 text-center">
              <p>Scan this QR code to identify this node location.</p>
              <p className="mt-1">
                Format: WF-{`{BUILDING}`}-{`{FLOOR}`}-{`{NODE}`}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

export default function QRCodePage() {
  return (
    <ProtectedRoute>
      <QRCodeContent />
    </ProtectedRoute>
  );
}

