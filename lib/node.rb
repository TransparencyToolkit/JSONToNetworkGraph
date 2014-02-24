class Node
  def initialize(num, name, type, value)
    @num = num
    @name = name
    @type = type
    @group = nil
    @linkcount = 0
    @value = Array.new
    @value.push(value)
  end

  def update(toadd)
    @value.push(toadd)
  end
  
  def getID
    return @num
  end

  def getName
    return @name
  end

  def getType
    return @type
  end

  def getValue
    return @value
  end
  
  def setGroup(group)
    @group = group
  end

  def addLink
    @linkcount += 1
  end

  def nodeData
    json_hash = {:name => @name, :type => @type, :group => @group, :linkcount => @linkcount, :data => @value}
  end
end
