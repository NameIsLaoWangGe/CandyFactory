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
    /**随机旋转方向和值*/
    private rotationD: number;
    /**爆炸类型，是什么颜色、形态的糖果或者敌人或者是烟雾等*/
    private effectsType: string;
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
        this.effectsType = type;
        this.moveSwitch = true;
        this.randomSpeed = Math.floor(Math.random() * 8) + 8;
        this.initialAngle = Math.floor(Math.random() * 360);
        this.scale = Math.floor(Math.random() * 8) + 4;
        this.self.scaleX = this.scale / 10;
        this.self.scaleY = this.scale / 10;
        this.vinshTime = Math.floor(Math.random() * 5) + 2;
        this.startAlpha = (Math.floor(Math.random() * 10) + 5) / 10;
        this.self.alpha = this.startAlpha;
        this.rotationD = Math.floor(Math.random() * 2) === 1 ? -20 : 20;
        // 类型暂时只和颜色匹配
        switch (type) {
            case 'fighting':
                this.img.skin = 'candy/特效/白色单元.png';
                break;
            case 'range':
                this.img.skin = 'candy/特效/黑色单元.png';
                break;
            case 'redCandy___':
                this.img.skin = 'candy/特效/红色单元.png';
                break;
            case 'greenCandy_':
                this.img.skin = 'candy/特效/绿色单元.png';
                break;
            case 'blueCandy__':
                this.img.skin = 'candy/特效/蓝色单元.png';
                break;
            case 'yellowCandy':
                this.img.skin = 'candy/特效/黄色单元.png';
                break;
            case 'fireworks':
                this.fireworksPic();
                break;
            default:
                break;
        }
        this.img.pivotX = this.img.width / 2;
        this.img.pivotY = this.img.height / 2;
    }

    /**烟花爆炸图片赋值规则*/
    fireworksPic(): void {
        let number = Math.floor(Math.random() * 7) + 1;
        switch (number) {
            case 1:
                this.img.skin = 'candy/特效/烟花1.png';
                break;
            case 2:
                this.img.skin = 'candy/特效/烟花2.png';
                break;
            case 3:
                this.img.skin = 'candy/特效/烟花3.png';
                break;
            case 4:
                this.img.skin = 'candy/特效/烟花4.png';
                break;
            case 5:
                this.img.skin = 'candy/特效/烟花5.png';
                break;
            case 6:
                this.img.skin = 'candy/特效/烟花6.png';
                break;
            case 6:
                this.img.skin = 'candy/特效/烟花7.png';
                break;
            default:
                break;
        }

    }

    /**移动规则*/
    move(): void {
        if (this.effectsType === 'fireworks') {
            this.fireworksExplosion();
        } else {
            this.commonExplosion();
        }
    }

    /**普通爆炸移动规则*/
    commonExplosion(): void {
        this.accelerated += 0.2;
        if (this.timer > 0 && this.timer <= 10) {
            this.commonSpeedXYByAngle(this.initialAngle, this.randomSpeed);
        } else if (this.timer > 10 && this.timer < 20) {
            this.self.alpha -= 0.01;
            this.commonSpeedXYByAngle(this.initialAngle, this.randomSpeed);
        } else if (this.timer >= 20 && this.timer < 22) {
        } else if (this.timer >= 22) {
            this.vinshTime -= 0.1;
            if (this.vinshTime < 0) {
                this.self.removeSelf();
            }
        }
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

    /**烟花爆炸移动*/
    fireworksExplosion(): void {
        this.img.rotation += this.rotationD;
        this.accelerated += 0.1;
        if (this.timer > 0 && this.timer <= 10) {
            this.commonSpeedXYByAngle(this.initialAngle, this.randomSpeed + 7);
        } else if (this.timer > 10 && this.timer < 15) {
            this.commonSpeedXYByAngle(this.initialAngle, this.randomSpeed);
        } else if (this.timer >= 15 && this.timer < 20) {
            this.self.alpha -= 0.1;
        } else if (this.timer >= 20) {
            this.self.removeSelf();
        }
    }

    onUpdate(): void {
        if (this.moveSwitch) {
            this.timer += 1;
            this.move();
        }
    }
    onDisable(): void {
    }
}