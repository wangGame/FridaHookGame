import "frida-il2cpp-bridge";

Il2Cpp.perform(() => {
    const Game = Il2Cpp.domain.assembly("Assembly-CSharp").image.class("Game");
    const method = Game.method("CalculateBlockPriority");

    function toObject(p: NativePointer): Il2Cpp.Object | null {
        try {
            return p.isNull() ? null : new Il2Cpp.Object(p);
        } catch {
            return null;
        }
    }

    function countOf(obj: Il2Cpp.Object | null): string {
        if (obj == null) return "null";

        try {
            return String(obj.method("get_Count").invoke()) + " (" + obj.class.name + ")";
        } catch (_) {
            try {
                return String(obj.method("get_Length").invoke()) + " (" + obj.class.name + ")";
            } catch (_) {
                return "unknown (" + obj.class.name + ")";
            }
        }
    }

    Interceptor.attach(method.virtualAddress, {
        onEnter(args) {
            this.assignments = args[2];
            this.usedVacants = args[3];
            this.usedDisplaced = args[4];

            const assignments1 = toObject(this.assignments);
            const usedVacants1 = toObject(this.usedVacants);
            const usedDisplaced1 = toObject(this.usedDisplaced);

            console.log("sssssssssssssss");
                console.log("assignments   = " + countOf(assignments1));
            console.log("usedVacants   = " + countOf(usedVacants1));
            console.log("usedDisplaced = " + countOf(usedDisplaced1));

            console.log("sssssssssssssss");
        },

        onLeave() {
            const assignments = toObject(this.assignments);
            const usedVacants = toObject(this.usedVacants);
            const usedDisplaced = toObject(this.usedDisplaced);

            console.log("assignments   = " + countOf(assignments));
            console.log("usedVacants   = " + countOf(usedVacants));
            console.log("usedDisplaced = " + countOf(usedDisplaced));
        }
    });
});