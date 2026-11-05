const connection = new Mongo("mongodb://mongo:27017");
const admin = connection.getDB("admin");
let status;
try {
    status = admin.runCommand({ replSetGetStatus: 1 });
} catch (error) {
    if (error.code !== 94) throw error;
    status = { ok: 0, code: 94 };
}
if (!status.ok) {
    if (status.code !== 94) throw new Error("Falha ao consultar replica set.");
    const result = admin.runCommand({ replSetInitiate: { _id: "rs0", members: [{ _id: 0, host: "mongo:27017" }] } });
    if (!result.ok) throw new Error("Falha ao iniciar replica set.");
}
let ready = false;
for (let attempt = 0; attempt < 60; attempt++) {
    if (admin.runCommand({ hello: 1 }).isWritablePrimary) { ready = true; break; }
    sleep(1000);
}
if (!ready) throw new Error("MongoDB não elegeu um nó primário.");
