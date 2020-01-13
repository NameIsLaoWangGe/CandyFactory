export default class Assembly extends Laya.Script {
    /** @prop {name:machine, tips:糖果制造机器, type:Node}*/
    public machine: Laya.Sprite;
    /** @prop {name:LongPointer, tips:长指针, type:Node}*/
    public LongPointer: Laya.Sprite;

    /**自己*/
    private self: Laya.Sprite;
    /**所属场景*/
    private selfScene: Laya.Scene;
    /**烟囱烟雾特效开关*/
    private smokeSwitch: boolean;
    /**烟囱烟雾特效产生的时间间隔*/
    private smokeInterval: number;
    /**烟囱烟雾特效当前产生时间记录*/
    private smokeTime: number;

    /**抖动频率，机器会按一定的时间抖动，这个时间间隔可能是随机的*/
    private shakeInterval: number;
    /**抖动事件记录*/
    private shakeTime: number;
    /**抖动开关*/
    private shakeSwitch: boolean;
    /**时间线*/
    private timer: number;
    /**方向记录*/
    private moveDirection: string;
    /**初始位置*/
    private initPosX: number;

    constructor() { super(); }

    onEnable(): void {
        this.self = this.owner as Laya.Sprite;
        this.selfScene = this.self.scene;
        this.smokeSwitch = true;
        this.smokeTime = Date.now();
        this.smokeInterval = 500;
        this.initPosX = this.machine.x;
        // 随机方向
        this.moveDirection = Math.random() * 2 === 1 ? 'left' : 'right';
        this.shakeInterval = 30;
        this.shakeTime = Date.now();
        this.timer = 0;
    }

    //机器抖动行为
    shake() {
        if (this.shakeSwitch) {
            let nowTime = Date.now();
            if (nowTime - this.shakeTime > this.shakeInterval) {
                this.shakeTime = nowTime;
                if (this.moveDirection === "left") {
                    this.machine.x -= 1;
                    if (this.machine.x < this.initPosX) {
                        this.moveDirection = "right";
                    }
                } else if (this.moveDirection === "right") {
                    this.machine.x += 1;
                    if (this.machine.x > this.initPosX) {
                        this.moveDirection = "left";
                    }
                }
            }
        }
    }

    onUpdate(): void {
        this.timer++;
        // 烟囱烟雾特效
        if (this.smokeSwitch) {
            let nowTime = Date.now();
            if (nowTime - this.smokeTime > this.smokeInterval) {
                // 重置时间
                this.smokeTime = nowTime;
                // 随机时间间隔
                let random = Math.floor(Math.random() * 300) + 100;
                this.smokeInterval = 600 - random;
                // 随机位置
                this.selfScene['MainSceneControl'].explodeAni(this.machine, 650, 190, 'smokeEffects', 1, 10);
            }
        }

        // 指针动作
        this.LongPointer.rotation += 10;
        // 机器抖动
        // 控制抖动的时间
        if (this.timer % 200 == 0) {
            if (this.shakeSwitch) {
                this.shakeSwitch = false;
            } else {
                this.shakeSwitch = true;
            }
        }
        this.shake();
    }

    onDisable(): void {
    }
}