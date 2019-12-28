export default class HintWord extends Laya.Script {
    /**自己*/
    private self: Laya.Sprite;
    /**属性标签*/
    private property: Laya.FontClip;
    /**属性值*/
    private number: Laya.FontClip;

    constructor() { super(); }

    onEnable(): void {
        this.self = this.owner as Laya.Sprite;
        this.self['HintWord'] = this;
        this.self.alpha = 0;
    }

    /**通过传入的参数来，设置属性图片字的格式
     * @param propertyType 属性类型
     * @param numberValue 属性值
     * */
    initProperty(propertyType: string, numberValue: number): void {
        this.property = this.self.getChildByName('property') as Laya.FontClip;
        this.property.value = propertyType;
        this.number = this.self.getChildByName('number') as Laya.FontClip;
        // 位置偏移，因为字符长度不一样
        switch (propertyType) {
            case '公鸡速度':
                this.property.x -= 40;
                break;
            case '攻击里':
                this.property.x -= 20;
                this.number.x -= 20;
                break;
            case '生命':
                this.number.x -= 40;
                break;
            case '防御力':
                this.property.x -= 20;
                this.number.x -= 20;
                break;
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