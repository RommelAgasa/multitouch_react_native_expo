import React, { useRef, useState } from "react";
import { GestureResponderEvent, PanResponder, StyleSheet, Text, View } from "react-native";

interface TouchInfo {
  buttonId: string;
  touchId: number;
}

export default function Index() {
  const [pressedButtons, setPressedButtons] = useState<Set<string>>(new Set());
  const [activeTouches, setActiveTouches] = useState<TouchInfo[]>([]);

  const buttonLayouts = useRef<{ [key: string]: { x: number; y: number; width: number; height: number } }>({}).current;

  // Check if a touch is inside a button
  const isTouchInside = (buttonId: string, x: number, y: number) => {
    const layout = buttonLayouts[buttonId];
    if (!layout) return false;
    return x >= layout.x && x <= layout.x + layout.width && y >= layout.y && y <= layout.y + layout.height;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const newTouches: TouchInfo[] = [];
        const newPressed = new Set<string>();

        // Check each touch point
        evt.nativeEvent.touches.forEach((touch, index) => {
          Object.keys(buttonLayouts).forEach((buttonId) => {
            if (isTouchInside(buttonId, touch.pageX, touch.pageY)) {
              newTouches.push({ buttonId, touchId: index });
              newPressed.add(buttonId);
              console.log(`Touch ${index} on ${buttonId}`);
            }
          });
        });

        setActiveTouches(newTouches);
        setPressedButtons(newPressed);
      },

      onPanResponderMove: (evt: GestureResponderEvent) => {
        const newTouches: TouchInfo[] = [];
        const newPressed = new Set<string>();

        evt.nativeEvent.touches.forEach((touch, index) => {
          Object.keys(buttonLayouts).forEach((buttonId) => {
            if (isTouchInside(buttonId, touch.pageX, touch.pageY)) {
              newTouches.push({ buttonId, touchId: index });
              newPressed.add(buttonId);
            }
          });
        });

        setActiveTouches(newTouches);
        setPressedButtons(newPressed);
      },

      onPanResponderRelease: (evt: GestureResponderEvent) => {
        // If there are remaining touches, update pressed buttons
        if (evt.nativeEvent.touches.length > 0) {
          const newPressed = new Set<string>();
          evt.nativeEvent.touches.forEach((touch) => {
            Object.keys(buttonLayouts).forEach((buttonId) => {
              if (isTouchInside(buttonId, touch.pageX, touch.pageY)) {
                newPressed.add(buttonId);
              }
            });
          });
          setPressedButtons(newPressed);
        } else {
          setPressedButtons(new Set());
          setActiveTouches([]);
        }
      },

      onPanResponderTerminationRequest: () => true,
      onPanResponderTerminate: () => {
        setPressedButtons(new Set());
        setActiveTouches([]);
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {["Button 1", "Button 2"].map((buttonId) => (
        <View
          key={buttonId}
          onLayout={(e) => {
            const layout = e.nativeEvent.layout;
            buttonLayouts[buttonId] = { x: layout.x, y: layout.y, width: layout.width, height: layout.height };
          }}
          style={[
            styles.button,
            { backgroundColor: pressedButtons.has(buttonId) ? "#FF9E42" : "#e4e0e0" },
          ]}
        >
          <Text style={styles.buttonText}>{buttonId}</Text>
          {activeTouches.filter((t) => t.buttonId === buttonId).length > 0 && (
            <Text style={styles.touchCount}>
              {activeTouches.filter((t) => t.buttonId === buttonId).length} finger(s)
            </Text>
          )}
        </View>
      ))}

      <View style={styles.status}>
        <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
          Pressed: {pressedButtons.size > 0 ? Array.from(pressedButtons).join(", ") : "None"}
        </Text>
        <Text style={{ fontSize: 12, color: "#666" }}>
          Total touches: {activeTouches.length}
        </Text>
        {activeTouches.map((touch, idx) => (
          <Text key={idx} style={{ fontSize: 12, color: "#666" }}>
            Finger {touch.touchId} → {touch.buttonId}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", gap: 20 },
  button: { padding: 20, borderRadius: 10, marginVertical: 10, width: 120, alignItems: "center" },
  buttonText: { fontWeight: "bold" },
  touchCount: { fontSize: 12, color: "#666", marginTop: 5 },
  status: { marginTop: 30, padding: 20, backgroundColor: "#f0f0f0", borderRadius: 10 },
});