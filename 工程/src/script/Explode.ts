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
    private randomSpeed: number;
    /**移动开关*/
    private moveSwitch: boolean;
    /**随机大小*/
    private scale: number;
    /**随机消失时间*/
    private vinshTime: number;
    /**随机起始透明度*/
    private startAlpha: number;
    /**爆炸类型，是什么颜色、形态的糖果或者敌人或者是烟雾等*/
    private type: number;
    /**子节点图片*/
    private img: Laya.Image;

    constructor() { super(); }

    onEnable(): void {
        this.timer = 0;
        this.accelerated = 0.1;
        this.self = this.owner as Laya.Sprite;
        this.img = this.self.getChildByName('img') as Laya.Image;
        this.self['Explode'] = this;
    }

    /**初始化参数*/
    initProperty(type): void {
        this.moveSwitch = true;
        this.randomSpeed = Math.floor(Math.random() * 8) + 8;
        this.initialAngle = Math.floor(Math.random() * 360);
        this.scale = Math.floor(Math.random() * 10) + 4;
        this.self.scaleX = this.scale / 10;
        this.self.scaleY = this.scale / 10;
        this.vinshTime = Math.floor(Math.random() * 5) + 2;
        this.startAlpha = (Math.floor(Math.random() * 10) + 5) / 10;
        this.self.alpha = this.startAlpha;
        // 类型暂时只和颜色匹配
        switch (type) {
            case 'fighting':
                this.img.skin = 'candy/蓝色爆炸单元.png';
                break;
            case 'range':
                this.img.skin = 'candy/黄色爆炸单元.png';
                break;
            case '':
                break;
            default:
                break;
        }
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
    /**根据爆炸类型绘制矢量图爆炸单元*/
    explosionUnit(): void {

    }
    onUpdate(): void {
        if (this.moveSwitch) {
            this.timer += 1;
            this.accelerated += 0.1;
            if (this.timer > 0 && this.timer <= 8) {
                this.move();
            } else if (this.timer > 8 && this.timer < 20) {
                if (this.randomSpeed > 0) {
                    this.randomSpeed -= 1;
                }
                if (this.accelerated > 0) {
                    this.accelerated -= 0.1;
                }
                this.move();
            } else if (this.timer >= 20 && this.timer < 22) {
                this.self.alpha -= 0.05;
            } else if (this.timer >= 22) {
                this.vinshTime -= 0.1;
                if (this.vinshTime < 0) {
                    this.self.removeSelf();
                }
            }
        }
    }
    onDisable(): void {
    }
}