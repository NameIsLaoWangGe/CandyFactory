export default class HintWord extends Laya.Script {
    /**自己*/
    private self: Laya.Sprite;
    /**增加属性属性标签*/
    private propertyType: Laya.FontClip;
    /**增加属性值属性值*/
    private addNumber: Laya.FontClip;
    /**减少属性值属性值*/
    private subNumber: Laya.FontClip;

    constructor() { super(); }

    onEnable(): void {
        this.self = this.owner as Laya.Sprite;
        this.self['HintWord'] = this;
        this.self.alpha = 0;//出现的时候隐身，方便做动画

        this.propertyType = this.self.getChildByName('propertyType') as Laya.FontClip;
        this.addNumber = this.self.getChildByName('addNumber') as Laya.FontClip;
        this.subNumber = this.self.getChildByName('subNumber') as Laya.FontClip;

        this.propertyType.value = null;
        this.addNumber.value = null;
        this.subNumber.value = null;
    }

    /**通过传入的参数来，设置属性图片字的格式
     * @param propertyType 属性类型
     * @param numberValue 属性值
     * */
    initProperty(propertyType: string, numberValue: number): void {

        // 位置偏移，因为字符长度不一样
        switch (propertyType) {
            // 属性增加
            case '公鸡速度':
                this.propertyType.value = '公鸡速度';
                this.propertyType.x -= 40;
                this.addNumber.value = "+" + numberValue;
                break;
            case '攻击里':
                this.propertyType.value = '攻击里';
                this.propertyType.x -= 20;
                this.addNumber.x -= 20;
                this.addNumber.value = "+" + numberValue;
                break;
            case '生命':
                this.propertyType.value = '生命';
                this.addNumber.x -= 40;
                this.addNumber.value = "+" + numberValue;
                break;
            case '防御力':
                this.propertyType.value = '防御力';
                this.propertyType.x -= 20;
                this.addNumber.x -= 20;
                this.addNumber.value = "+" + numberValue;
                break;

            // 属性减少
            case '减少公鸡速度':
                this.propertyType.value = '公鸡速度';
                this.subNumber.x -= 40;
                this.subNumber.value = "-" + numberValue;
                break;
            case '减少攻击里':
                this.propertyType.value = '攻击里';
                this.propertyType.x -= 20;
                this.subNumber.x -= 20;
                this.subNumber.value = "-" + numberValue;
                break;
            case '减少生命':
                this.propertyType.value = '生命';
                this.subNumber.x -= 40;
                this.subNumber.value = "-" + numberValue;
                break;
            case '减少防御力':
                this.propertyType.value = '防御力';
                this.propertyType.x -= 20;
                this.subNumber.x -= 20;
                this.subNumber.value = "-" + numberValue;
                break;

            // 敌我减血
            case '主角掉血':
                this.subNumber.x -= 80;
                this.subNumber.value = "-" + numberValue;
            case '敌人掉血':
                this.subNumber.x -= 80;
                this.subNumber.value = "-" + numberValue;

            default:
                break;
        }
        this.hintWordMove();
    }

    /**飘字动画时间线*/
    hintWordMove(): void {
        let timeLine = new Laya.TimeLine;
        timeLine.addLabel('appear', 0).to(this.self, { y: this.self.y - 60, alpha: 1 }, 100, null, 0)
            .addLabel('pause', 0).to(this.self, { y: this.self.y - 120 }, 800, null, 0)
            .addLabel('vanish', 0).to(this.self, { y: this.self.y - 150, alpha: 0 }, 100, null, 0)
        timeLine.play('appear', false);
        timeLine.on(Laya.Event.COMPLETE, this, function () {
            this.self.removeSelf();
        });
    }

    onDisable(): void {
    }
}