import mosca, { Client, Packet } from "mosca";
import mqtt, { Packet as ClientPacket } from "mqtt";

import {
  TOPIC_MOBIUS_CONTROL_REQ_AUTH,
  TOPIC_MOBIUS_DATA_RES_AUTH,
  TOPIC_NCUBE_CONTROL_AUTH_START,
  TOPIC_NCUBE_CONTROL_AUTH_REQ_AUTH,
  TOPIC_NCUBE_DATA_AUTH_RES_AUTH,
  TOPIC_NCUBE_DATA_ENC_RES_ENC,
  TOPIC_NCUBE_DATA_SIG_RES_SIG,
} from "./Topics";

const settings = {
  port: 1883,
};

const mqtt_server = new mosca.Server(settings);

mqtt_server.on("ready", function () {
  console.log("MQTT broker is ready.");
  startRelayClient();
});

mqtt_server.on("clientConnected", (client: Client) => {
  console.log("on clientConnected called.");
  console.log("client: ", client);
});

mqtt_server.on("published", (packet: Packet, client: Client) => {
  console.log("on published called.");
  // console.log("packet: ", packet);
  // console.log("client: ", client);
});

const startRelayClient = () => {
  const isSecure = false;
  const host = "localhost";
  const port = isSecure ? "8883" : "1883";
  const protocol = isSecure ? "mqtts" : "mqtt";
  const protocolId = "MQTT";
  const protocolVersion = 4;

  const connectOptions = {
    host,
    port,
    protocol,
    keepalive: 10,
    protocolId,
    protocolVersion,
    clean: true,
    reconnectPeriod: 2000,
    connectTimeout: 2000,
    // key: fs.readFileSync("./server-key.pem"),
    // cert: fs.readFileSync("./server-crt.pem"),
    rejectUnauthorized: false,
  };

  const mqtt_client = mqtt.connect(connectOptions);

  mqtt_client.on("connect", () => {
    mqtt_client.subscribe(TOPIC_NCUBE_DATA_AUTH_RES_AUTH);
    console.log(
      "subscribe nCube auth response topic at " +
        TOPIC_NCUBE_DATA_AUTH_RES_AUTH,
    );

    mqtt_client.subscribe(TOPIC_NCUBE_DATA_ENC_RES_ENC);
    console.log(
      "subscribe nCube encryption response topic at " +
        TOPIC_NCUBE_DATA_ENC_RES_ENC,
    );

    mqtt_client.subscribe(TOPIC_NCUBE_DATA_SIG_RES_SIG);
    console.log(
      "subscribe nCube signing response topic at " +
        TOPIC_NCUBE_DATA_SIG_RES_SIG,
    );

    mqtt_client.subscribe(TOPIC_MOBIUS_DATA_RES_AUTH);
    console.log(
      "subscribe Mobius auth response topic at " + TOPIC_MOBIUS_DATA_RES_AUTH,
    );

    setInterval(() => {
      mqtt_client.publish(TOPIC_NCUBE_CONTROL_AUTH_START, "");
    }, 8000);
  });

  mqtt_client.on(
    "message",
    (topic: string, message: Buffer, packet: ClientPacket) => {
      switch (topic) {
        case TOPIC_NCUBE_DATA_AUTH_RES_AUTH: {
          mqtt_client.publish(
            TOPIC_MOBIUS_CONTROL_REQ_AUTH,
            message.toString(),
          );
          break;
        }
        case TOPIC_NCUBE_DATA_ENC_RES_ENC: {
          mqtt_client.publish(
            TOPIC_MOBIUS_CONTROL_REQ_AUTH,
            message.toString(),
          );
          break;
        }
        case TOPIC_NCUBE_DATA_SIG_RES_SIG: {
          mqtt_client.publish(
            TOPIC_MOBIUS_CONTROL_REQ_AUTH,
            message.toString(),
          );
          break;
        }
        case TOPIC_MOBIUS_DATA_RES_AUTH: {
          mqtt_client.publish(
            TOPIC_NCUBE_CONTROL_AUTH_REQ_AUTH,
            message.toString(),
          );
          break;
        }
        default:
          return;
      }
    },
  );
};
