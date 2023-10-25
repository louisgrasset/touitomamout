import { ClipboardIcon } from "@radix-ui/react-icons";
import { Button, TextArea } from "@radix-ui/themes";
import React from "react";

const Configuration = ({ configuration }) => {
  const onCopyHandler = () => {
    // Copy configuration to clipboard
    // eslint-disable-next-line no-undef
    navigator?.clipboard.writeText(configuration);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "400px",
      }}
    >
      <Button
        color="cyan"
        onClick={onCopyHandler}
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          zIndex: 1,
          cursor: "pointer",
        }}
      >
        <ClipboardIcon width="16" height="16" /> Copy
      </Button>
      <TextArea
        style={{ minHeight: "300px" }}
        size="3"
        disabled={true}
        value={configuration}
      />
    </div>
  );
};

export { Configuration };
