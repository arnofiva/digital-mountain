
import config from "@arcgis/core/config";
import { SpatialReference } from "@arcgis/core/geometry";
import request from "@arcgis/core/request";
import StreamLayerEvent from "./streamLayerEvent";

const connections = new Map<string | URL, MockWebSocket>();

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  public onopen: () => void;
  public onmessage: (message: any) => void;

  private count = 0;
  public destroyed = false;
  public readyState = MockWebSocket.CONNECTING;

  constructor(url: string | URL, protocols?: string | string[]) {


    console.log("New socket", { url, protocols });

    setTimeout(() => {
      console.log("Socket open");
      this.readyState = MockWebSocket.OPEN;
      this.onopen();
    }, 1);

    connections.set(url, this);
  }

  loop() {
    if (this.destroyed) {
      return;
    }

    this.onmessage({
      data: JSON.stringify(messages[this.count++ % messages.length])
    });

    setTimeout(() => {
      this.loop();
    }, 1000);
  }

  send(data: any) {
    console.log("Send", { data });

    setTimeout(() => {
      // GeoEventConnection.ts expects that handshake
      this.onmessage({
        data: JSON.stringify({ filter: "{}" })
      });
      this.loop();
    }, 1);
  }

  close() {
    console.log("Close connection!");
    this.readyState = MockWebSocket.CLOSED;
    this.destroyed = true;
  }
}

class StreamLayerMock {

  private _featureLayerSourceJSON: Promise<any>;

  constructor(private streamUrl: string, private featureLayerUrl: string) {

    window.WebSocket = MockWebSocket as any;

    const regex = /https:\/\/((.*)\/([a-zA-Z0-9_]*)\/StreamServer)/; // "https://us-iot.arcgis.com/bc1qjuyagnrebxvh/bc1qjuyagnrebxvh/streams/arcgis/rest/services/snowCat_StreamLayer4/StreamServer"
    const urlParts = regex.exec(streamUrl);
    const streamPath = urlParts[1];
    const streamName = urlParts[3];
    const webSocketUrl = `wss://${streamPath}`;

    console.log("REGEX", {urlParts});

    config.request.interceptors.push({
      urls: [streamUrl, featureLayerUrl],

      before: async (params) => {
        const url = params.url;
        console.log("Before", url, {params});
        if (url === streamUrl) {
          console.log("Mock Stream");
          const sourceJSON = await this.loadFeatureLayerJSON(params.requestOptions);
          return {
              capabilities: "broadcast,subscribe",
              currentVersion: 11,
              description: null,
              displayField: "x",
              drawingInfo: sourceJSON.drawingInfo,
              fields: sourceJSON.fields.filter((f: any) => f.name !== "objectid"),
              geometryField: null,
              geometryType: sourceJSON.geometryType,
              globalIdField: "globalid",
              hasZ: sourceJSON.hasZ,
              keepLatest: {
                dataSourceLayerName: streamName,
                dataSourceName: streamName,
                datastoreUrl: "",
                flushInterval: 50,
                maxTransactionSize: 1000,
              },
              keepLatestArchive: {
                featuresUrl: featureLayerUrl,
                maximumFeatureAge: 0,
                updateInterval: 30
              },
              objectIdField: null,
              portalProperties: {/* TODO */},
              spatialReference: SpatialReference.WebMercator.toJSON(),
              streamUrls: [{
                token: "MOCK_TOKEN",
                transport: "ws",
                urls: [webSocketUrl]
              }],
              timeInfo: {
                trackIdField: "track_id"
              },
          };
        }
      },
      after: (response) => {
        console.log("After", {response});
      }
    })    
  }

  private loadFeatureLayerJSON(requestOptions: __esri.RequestOptions) {
    if (!this._featureLayerSourceJSON) {
      this._featureLayerSourceJSON = request(this.featureLayerUrl, requestOptions)
        .then((response) => {
          return response.data;
        });
    }

    return this._featureLayerSourceJSON;
  }

  setEvents(events: StreamLayerEvent[]) {

  }

  start() {

  }

  stop() {

  }

}

export default StreamLayerMock;


const messages = [
  {
    attributes: {
      track_id: 0,
      y: 46.75244804,
      x: 1675183865170,
      globalid: "{33C55882-4997-990C-1E3E-451C5230C021}"
    },
    geometry: {
      x: 1067768.8403578121,
      y: 5901760.486477842,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75229491,
      x: 1675183866170,
      globalid: "{5E3D5361-25BD-4BD3-EFA4-A3FA0D5B8ABA}"
    },
    geometry: {
      x: 1067762.271060702,
      y: 5901735.606841403,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75212881,
      x: 1675183867170,
      globalid: "{2478E389-4BBB-C298-287B-E036D1B6473F}"
    },
    geometry: {
      x: 1067764.3978195738,
      y: 5901708.619997716,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75196319,
      x: 1675183868170,
      globalid: "{3347A5ED-67BF-6393-95AB-A8E604668DF4}"
    },
    geometry: {
      x: 1067766.8052148817,
      y: 5901681.711224108,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.7518017,
      x: 1675183869170,
      globalid: "{2941D384-A86A-3F2F-16B0-B4947A3E3A82}"
    },
    geometry: {
      x: 1067771.6266846668,
      y: 5901655.473543498,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75164021,
      x: 1675183870170,
      globalid: "{B88DD6F2-8DBC-01E8-5182-1F20317A3074}"
    },
    geometry: {
      x: 1067776.4482657716,
      y: 5901629.235941505,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75147457,
      x: 1675183871171,
      globalid: "{D8AED2DC-3A36-4903-F79F-1FC783ABEC7D}"
    },
    geometry: {
      x: 1067778.5888282598,
      y: 5901602.32416242,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.7513079,
      x: 1675183872171,
      globalid: "{6EA66FCB-5170-E3BF-384C-28CCAA354CB4}"
    },
    geometry: {
      x: 1067780.0590247747,
      y: 5901575.245121174,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75114528,
      x: 1675183873171,
      globalid: "{945D107E-5013-C86D-76A6-34FCCAF72D58}"
    },
    geometry: {
      x: 1067776.4363545862,
      y: 5901548.824168181,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75098371,
      x: 1675183874171,
      globalid: "{AC3EAD99-DDEF-7FC5-1B19-E334B6A13411}"
    },
    geometry: {
      x: 1067771.661416348,
      y: 5901522.573888163,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75082648,
      x: 1675183875171,
      globalid: "{FEED8580-99D9-4334-27C0-1B6E7AC2686C}"
    },
    geometry: {
      x: 1067765.3331259352,
      y: 5901497.028803554,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75066997,
      x: 1675183876171,
      globalid: "{29F6402C-0BBE-14EE-874B-65F19423861C}"
    },
    geometry: {
      x: 1067758.8446467754,
      y: 5901471.600771018,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75053102,
      x: 1675183877171,
      globalid: "{23CC5907-B57A-1EDE-AE1B-70D3680A12EF}"
    },
    geometry: {
      x: 1067748.4923794095,
      y: 5901449.0257570455,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75040896,
      x: 1675183878171,
      globalid: "{06A8D635-FDFE-DF50-8BCA-80F52A869989}"
    },
    geometry: {
      x: 1067736.654553439,
      y: 5901429.1948859915,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75035055,
      x: 1675183879171,
      globalid: "{86AF2005-AC26-F5A6-F868-375A95C129F6}"
    },
    geometry: {
      x: 1067719.214908053,
      y: 5901419.705133091,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75029215,
      x: 1675183880171,
      globalid: "{3CF79297-F971-766D-0A69-3DB694902DF9}"
    },
    geometry: {
      x: 1067701.7752626669,
      y: 5901410.21701515,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75028764,
      x: 1675183881172,
      globalid: "{03C394F9-CADC-FFC4-BBA5-1E10024E194F}"
    },
    geometry: {
      x: 1067683.176002145,
      y: 5901409.484285923,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75028345,
      x: 1675183882172,
      globalid: "{61580678-9A77-1CE3-81FC-77756A8DA1F4}"
    },
    geometry: {
      x: 1067664.569617176,
      y: 5901408.803546405,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75027926,
      x: 1675183883172,
      globalid: "{57112236-2C29-4439-D0C5-890041596763}"
    },
    geometry: {
      x: 1067645.9633435265,
      y: 5901408.12280694,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75029177,
      x: 1675183884172,
      globalid: "{353A146A-C751-74D1-F029-11633C9C9179}"
    },
    geometry: {
      x: 1067627.4177389992,
      y: 5901410.155277427,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75030685,
      x: 1675183885172,
      globalid: "{66F9D9BF-5E3D-404D-1768-6210A4405806}"
    },
    geometry: {
      x: 1067608.8813739899,
      y: 5901412.605290444,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75032192,
      x: 1675183886172,
      globalid: "{8C237111-C493-9256-1CCA-D3162B32884F}"
    },
    geometry: {
      x: 1067590.3451202998,
      y: 5901415.053679464,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.750337,
      x: 1675183887172,
      globalid: "{92758789-C500-00E2-445E-94BE32243A56}"
    },
    geometry: {
      x: 1067571.8087552905,
      y: 5901417.503693851,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75035208,
      x: 1675183888172,
      globalid: "{EB9F44D9-7F68-77F4-9BCC-118FF590F693}"
    },
    geometry: {
      x: 1067553.2725016004,
      y: 5901419.953708921,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75040103,
      x: 1675183889172,
      globalid: "{CAD98051-6CDC-0AFB-F4E4-35F0160461B9}"
    },
    geometry: {
      x: 1067535.604873897,
      y: 5901427.9065145515,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75046032,
      x: 1675183890172,
      globalid: "{C0DE20F4-D513-F0D8-85BD-BAB883D6EA61}"
    },
    geometry: {
      x: 1067518.2022979013,
      y: 5901437.53924835,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75051961,
      x: 1675183891172,
      globalid: "{B64C9C00-394D-8BF4-2B1A-E9231414EA7E}"
    },
    geometry: {
      x: 1067500.7996105864,
      y: 5901447.1719927415,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.7505789,
      x: 1675183892172,
      globalid: "{C1E92904-4C16-BE43-A10C-D462C4695D9C}"
    },
    geometry: {
      x: 1067483.3969232708,
      y: 5901456.804747732,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75063819,
      x: 1675183893172,
      globalid: "{FF22E407-63F8-A04A-B9C7-F186C55EE368}"
    },
    geometry: {
      x: 1067465.9943472752,
      y: 5901466.437513318,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75069748,
      x: 1675183894172,
      globalid: "{1843F83B-AEA0-215A-1F9D-FFDBD8FA4436}"
    },
    geometry: {
      x: 1067448.59165996,
      y: 5901476.070289501,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75075676,
      x: 1675183895172,
      globalid: "{521B55C2-F482-D7CB-16B7-9CC242238D7C}"
    },
    geometry: {
      x: 1067431.1889726447,
      y: 5901485.701451592,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.7508374,
      x: 1675183896172,
      globalid: "{6D7DC26C-0DA6-F9BA-C538-834F4F9B10F7}"
    },
    geometry: {
      x: 1067415.1094287972,
      y: 5901498.802968443,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75093907,
      x: 1675183897172,
      globalid: "{07FC0C27-70AC-1D90-F263-B1FA173403DA}"
    },
    geometry: {
      x: 1067400.3344380623,
      y: 5901515.321240655,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75104075,
      x: 1675183898172,
      globalid: "{8B6DF2EA-FE77-DD37-9BC8-F384B7FD810E}"
    },
    geometry: {
      x: 1067385.5594473272,
      y: 5901531.841168725,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75114243,
      x: 1675183899172,
      globalid: "{FC4E31B0-AFA2-AB52-6481-18D203128EB3}"
    },
    geometry: {
      x: 1067370.7845679116,
      y: 5901548.361127964,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75124255,
      x: 1675183900172,
      globalid: "{4E287FAF-FD46-8FC4-4BB2-5323B0055F7A}"
    },
    geometry: {
      x: 1067355.899704839,
      y: 5901564.627664303,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75131909,
      x: 1675183901172,
      globalid: "{2DE6368E-9D3D-241E-AAE9-0EBCC0744879}"
    },
    geometry: {
      x: 1067339.3526191302,
      y: 5901577.06316902,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75139564,
      x: 1675183902172,
      globalid: "{F7A4F2E4-72B3-AFE4-2539-A893363B78D8}"
    },
    geometry: {
      x: 1067322.805533421,
      y: 5901589.500316106,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75147218,
      x: 1675183903172,
      globalid: "{7479ABA7-8DB2-F4F6-5C46-2E5F38ACBCF0}"
    },
    geometry: {
      x: 1067306.258447712,
      y: 5901601.935856144,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75154873,
      x: 1675183904173,
      globalid: "{173A15CA-2C9B-D8F3-B65C-7A21A44A9C72}"
    },
    geometry: {
      x: 1067289.7113620033,
      y: 5901614.373038557,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  }
];


