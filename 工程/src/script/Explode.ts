import tools from "./Tool";
export default class Explode extends Laya.Script {
    /**自己*/
    private self: Laya.Sprite;
    /**时间线*/
    private timer: number;
    /**角度*/
    private initialAngle: number;
    /**加速度*/
    private accelerated: number;
    /**基础速度*/
    private basedSpeed: number;
    /**基础速度*/
    private randomSpeed: number;
    /**移动开关*/
    private moveSwitch: boolean;
    /**随机大小*/
    private scale: number;

    constructor() { super(); }

    onEnable(): void {
        this.timer = 0;
        this.accelerated = 0.1;
        this.self = this.owner as Laya.Sprite;
        this.self['Explode'] = this;
        this.moveSwitch = false;
    }

    /**移动规则*/
    move(): void {
        this.commonSpeedXYByAngle(this.initialAngle, this.randomSpeed);
    }
    /**
        * 通用子弹移动，按单一角度移动
        * @param angle 角度
        *  @param basedSpeed 基础速度
       */
    commonSpeedXYByAngle(angle, speed) {
        this.self.x += tools.speedXYByAngle(angle, speed + this.accelerated).x;
        this.self.y += tools.speedXYByAngle(angle, speed + this.accelerated).y;
    }

    onUpdate(): void {
        if (this.moveSwitch) {
            this.timer += 1;
            this.accelerated += 0.1;
            this.move();
            if (this.timer >= 30) {
                this.self.removeSelf();
            }
        }
    }
    onDisable(): void {
    }
}